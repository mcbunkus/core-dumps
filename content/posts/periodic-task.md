---
title: How to Make a Periodic Task Runner
date: 2024-10-11T17:17:51-05:00
draft: false
tags:
  - cpp
  - snippets
summary: This is mostly for me to use at work later.
---

You found yourself in a situation where you need to do one task 10 times a second, another 100 times a second, and another every 2 seconds. Wouldn't it be nice to have an easy way to do that easily and repeatably? 

There is!

```cpp
// PeriodicTask.h

#include <chrono>
#include <functional>

using namespace std::chrono;

class PeriodicTask 
{
    double m_hertz;
    std::atomic_bool m_stop{false};

public:
    explicit PeriodicTask(double hertz) : m_hertz(hertz) { }

    void Start(const std::function<void()> &func) const {

        std::thread([&]() {
            const auto period = round<milliseconds>(
                duration<double>(1.0 / m_hertz)
			);

            auto sleepUntil = steady_clock::now();

            while (!m_stop) {
                sleepUntil += period;
                func();
                std::this_thread::sleep_until(sleepUntil);
            }
        }).detach();

    }

    void Stop() {
        m_stop = true;
    }

    ~PeriodicTask() {
        Stop();
    }
};
```


## Usage

It's pretty simple to use. Pass your desired frequency expressed as Hertz to the constructor, and call `Start` with a callback. It will be executed repeatedly at the desired frequency until `Stop` is called.

```cpp
#include "PeriodicTask.h"

int main() {
	PeriodicTask task{10}; // 10 Hz, or 10 times a second

	task.Start([]() {
		std::cout << "Hello, world!\n";
	});

	// ...

	task.Stop(); // Stop is also called when task goes out of scope
}
```


## Explanation

I realize the `Start` method is not as straightforward as it could be. I tried the following approach:

```cpp
void Start(const std::function<void()> &func) const {

	std::thread([&]() {
		const auto period = round<milliseconds>(
			duration<double>(1.0 / m_hertz)
		);

		while (!m_stop) {
			const auto sleepUntil = steady_clock::now() + period;
			func();
			std::this_thread::sleep_until(sleepUntil);
		}
	}).detach();

}
```

However, you may have noticed the issue (what I suspect it to be, anyway). The loop doesn't necessarily loop back around to the beginning right away. There's might be a little delay introduced from threads switching contexts (my ignorance is showing, but I believe you will understand what I'm trying to say). With this solution, I noticed that if `func` should be called every 10 ms, it was being called every 11-15 ms on average. The delay was compounding itself when I calculated `sleepUntil` at the beginning of the loop.

The final `Start` method runs at the frequency you would expect. `sleepUntil` is created before the loop starts, but incremented before `func()` with `period` to prevent a double delay on the first loop.