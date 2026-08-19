const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));
const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

const bios = {
  'ryan-mcneil': {
    name: 'Ryan McNeil',
    role: 'Founder & Principal · Developer · Entrepreneur',
    img: "url('/assets/ryan-mcneil-founder.jpg')",
    paragraphs: [
      'Ryan McNeil is the Founder and Managing Principal of McNeil Development, a New England-based real estate development and investment firm focused on creating high-quality residential and mixed-use properties in some of the region’s most desirable coastal markets. Since founding the company in 2024, Ryan has grown the firm to more than $100 million in assets under management, with projects spanning Nantucket, Greater Boston, Cape Cod, Martha’s Vineyard, Newport, and other select New England communities.',
      'A 2022 graduate of Princeton University, Ryan was a four-year varsity football player and three-time All-Ivy League selection. The discipline, resilience, and leadership developed through Division I athletics continue to shape his approach to business, driving a commitment to excellence, accountability, and long-term value creation.',
      'Ryan’s experience spans the full development lifecycle, including acquisitions, capital raising, underwriting, design, permitting, construction management, and asset disposition. He has led a diverse range of projects, from luxury single-family residences and condominium conversions to multifamily and mixed-use developments. Known for his hands-on approach, Ryan remains actively involved in every stage of each project, ensuring that execution aligns with the firm’s standards for quality, efficiency, and design.',
      'With a deep appreciation for New England’s coastal communities, Ryan focuses on identifying opportunities where thoughtful development can enhance neighborhoods while delivering exceptional experiences for homeowners, residents, and investors alike. His investment philosophy centers on creating enduring assets in locations with strong fundamentals, limited supply, and lasting demand.',
      'Today, Ryan continues to expand McNeil Development’s portfolio while building strategic partnerships with investors, lenders, and industry professionals who share a long-term vision for thoughtful growth and value creation throughout New England.',
    ],
  },
  'koh-architects': {
    name: 'Dinah Klamert, R.A.',
    role: 'Principal-in-Charge · KOH Architecture, P.L.L.C.',
    imgLabel: 'KOH Architecture, P.L.L.C.',
    paragraphs: [
      'Dinah Klamert is a licensed architect in Massachusetts, New York, and several other states, and has been Principal-in-Charge of KOH Architecture, P.L.L.C. since 2005. She has received AIA Design Awards and other industry recognition for original work that challenges creativity, and brings over 25 years of construction and design experience to every project.',
      'Ms. Klamert is an expert in building codes, zoning, and construction trades, providing innovative and practical pathways to enable excellence in design and management of consultants, budgets, and schedules. Her firm maintains a high percentage of repeat clients built on comprehensive responsiveness to programmatic requirements and long-term business relationships.',
      'Her experience spans Residential Developments, Mixed-Use Developments, Standalone Retail, Educational Facilities, Industrial Warehouses, and Commercial Developments. She holds a Bachelor of Architecture and Bachelor of Science, magna cum laude, from Kent State University, with studies abroad in Florence, Italy and Lugano, Switzerland.',
    ],
  },
  'signature-building-systems': {
    name: 'Signature Building Systems',
    role: 'Modular Construction Manufacturer · Est. 1992',
    imgLabel: 'Signature Building Systems',
    paragraphs: [
      'Signature Building Systems is an award-winning modular manufacturer founded in 1992 by experts in systems-built housing. Signature is a leader in fabricating custom designed modular homes and multifamily buildings while collaborating with numerous parties including developers, homeowners, investors, and architects.',
      'Signature’s purpose-built modular factory has fabricated over 6,000 quality prefab living units throughout New England and the Mid-Atlantic, providing exceptional value and savings to residential home buyers and commercial developers — delivering quality modular construction along the East Coast.',
    ],
    link: { href: 'https://www.signaturebuildingsystems.com/about-signature-building-systems', label: 'signaturebuildingsystems.com' },
  },
};

const bioModal = document.getElementById('bio-modal');
if (bioModal) {
  const modalImg = document.getElementById('bio-modal-img');
  const modalRole = document.getElementById('bio-modal-role');
  const modalName = document.getElementById('bio-modal-name');
  const modalText = document.getElementById('bio-modal-text');
  let lastFocused = null;

  function openBio(key) {
    const bio = bios[key];
    if (!bio) return;
    modalImg.style.backgroundImage = bio.img || '';
    modalImg.className = 'bio-modal-img' + (bio.img ? '' : ' ph light');
    if (!bio.img) modalImg.setAttribute('data-label', bio.imgLabel || bio.name);
    else modalImg.removeAttribute('data-label');
    modalRole.textContent = bio.role;
    modalName.textContent = bio.name;
    modalText.innerHTML = bio.paragraphs.map(p => `<p>${p}</p>`).join('') +
      (bio.link ? `<p><a href="${bio.link.href}" target="_blank" rel="noopener">${bio.link.label}</a></p>` : '');
    lastFocused = document.activeElement;
    bioModal.hidden = false;
    bioModal.querySelector('.bio-modal-close').focus();
    document.body.style.overflow = 'hidden';
  }

  function closeBio() {
    bioModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-bio]').forEach(card => {
    card.addEventListener('click', () => openBio(card.getAttribute('data-bio')));
  });
  bioModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeBio));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !bioModal.hidden) closeBio(); });
}

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
