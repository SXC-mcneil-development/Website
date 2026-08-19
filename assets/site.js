const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));
const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const btn = inquiryForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(inquiryForm)).toString(),
      });
      if (!res.ok) throw new Error('Request failed');
      inquiryForm.reset();
      inquiryForm.hidden = true;
      status.hidden = false;
      status.textContent = 'Thank you — your inquiry has been received. We’ll be in touch shortly.';
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Submit a Seller Inquiry';
      status.hidden = false;
      status.textContent = 'Something went wrong. Please email ryan.mcneil51@gmail.com directly.';
    }
  });
}
