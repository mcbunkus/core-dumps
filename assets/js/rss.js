document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('rss-copy-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      const rssUrl = this.getAttribute('data-rss-url');
      if (!rssUrl) return;
      navigator.clipboard.writeText(rssUrl).then(() => {
        const toast = document.getElementById('rss-copy-toast');
        toast.style.display = 'inline';
        setTimeout(() => {
          toast.style.display = 'none';
        }, 1200);
      });
    });
  }
    
  console.log("rss btn is locked and loaded... apparently");
});
