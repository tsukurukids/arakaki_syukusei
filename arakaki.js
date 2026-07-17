document.addEventListener('DOMContentLoaded', function () {
    // --- Page Navigation ---
    const pageLinks = document.querySelectorAll('.page-link');
    const navLinks = document.querySelectorAll('header .nav-link, #mobile-menu .page-link');
    const contentSections = document.querySelectorAll('.content-section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    function showSection(targetId) {
        // Hide all sections and remove visible class
        contentSections.forEach(s => {
            s.classList.remove('active', 'visible');
        });
        
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            // Use a small timeout to allow the display property to change before starting the transition
            setTimeout(() => {
                targetSection.classList.add('visible');
            }, 50);
        }
        
        // Update navigation links active state
        navLinks.forEach(l => {
            l.classList.remove('active');
             if (l.dataset.target === targetId) {
                l.classList.add('active');
            }
        });

        // Close mobile menu if open
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }

        window.scrollTo(0, 0);
    }

    // --- Mobile Menu Toggle ---
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    pageLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        showSection(link.dataset.target);
    }));
    
    // Show the initial section with animation
    showSection('home');
    
    // --- Slideshow functionality ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    
    function showNextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }
    
    // Start slideshow - change image every 7 seconds
    if (slides.length > 0) {
        setInterval(showNextSlide, 7000);
    }

    // --- Contact Form Handling ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            
            // 送信中状態
            submitButton.disabled = true;
            submitButton.textContent = '送信中...';

            const formData = new FormData(contactForm);

            fetch('send_mail.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    contactForm.reset();
                } else {
                    alert('エラー: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('送信中にエラーが発生しました。ネットワーク接続を確認してください。');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }
});
