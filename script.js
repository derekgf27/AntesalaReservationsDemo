// ============================================
// DEMO MODE - ALWAYS ENABLED IN DEMO VERSION
// ============================================
// This is the DEMO VERSION for portfolio showcase
// Demo mode is ALWAYS enabled - no URL parameter needed
// Firebase is completely disabled - all data is fictional

// Force demo mode to always be true
const isDemoMode = true;

// Set global demo mode flag
window.DEMO_MODE = true;

// Always prevent Firebase from being used in demo version
console.log('🎭 DEMO VERSION - Always in demo mode. Using localStorage only, Firebase disabled');
window.FIREBASE_LOADED = false;
window.firestore = null;

// Reservation Management System
class ReservationManager {
    constructor() {
        this.reservations = [];
        this.beverageSelections = {};
        this.entremesesSelections = {};
        this.currentSection = 'dashboard';
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        this.firebaseUnsubscribe = null;
        this.isDemoMode = window.DEMO_MODE || false;
        this.initializeStorage();
        this.initializeEventListeners();
        this.initializeNavigation();
        this.updateGuestCountDisplay();
        this.calculatePrice();
        this.updateFoodServiceSummary();
        this.updateBeverageSummary();
        this.updateEntremesesSummary();
        this.updateDashboard();
        this.displayReservations();
    }

    // Initialize storage (Firebase or localStorage)
    async initializeStorage() {
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (this.isDemoMode) {
            console.log('🎭 DEMO MODE: Using localStorage with demo data only');
            // Load existing reservations from localStorage, or start with empty array
            this.reservations = this.loadReservationsFromLocalStorage();
            // Filter out any reservations that don't have proper structure (error cards)
            const validReservations = this.reservations.filter(reservation => {
                // Only keep reservations that have the required pricing structure
                const isValid = reservation && 
                               reservation.pricing && 
                               typeof reservation.pricing.totalCost === 'number' &&
                               reservation.clientName; // Must have client name
                if (!isValid) {
                    console.log('Filtering out invalid reservation:', reservation.id);
                }
                return isValid;
            });
            
            // Only update if we filtered something out
            if (validReservations.length !== this.reservations.length) {
                console.log(`Filtered out ${this.reservations.length - validReservations.length} invalid reservations`);
                this.reservations = validReservations;
                this.saveReservationsToLocalStorage();
            }
            // Don't load sample demo data - let users create their own reservations
        } else if (window.FIREBASE_LOADED && window.firestore) {
            console.log('Using Firebase Firestore for data storage');
            await this.loadReservationsFromFirestore();
            this.setupFirestoreListener();
        } else {
            console.log('Using localStorage for data storage');
            this.reservations = this.loadReservationsFromLocalStorage();
        }
        this.displayReservations();
        this.updateDashboard();
    }

    // Clear demo data to ensure no sensitive information
    clearDemoData() {
        // Clear the demo localStorage key
        localStorage.removeItem('antesalaReservations_demo');
        // Also clear any other potential demo-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('antesala') && key.includes('demo')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        this.reservations = [];
        console.log('🎭 Demo data cleared - ensuring clean demo environment');
    }

    // Load sample demo data - ALL DATA IS FICTIONAL FOR DEMONSTRATION ONLY
    loadSampleDemoData() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const twoWeeks = new Date(today);
        twoWeeks.setDate(today.getDate() + 14);
        const threeWeeks = new Date(today);
        threeWeeks.setDate(today.getDate() + 21);

        // ALL DATA BELOW IS FICTIONAL - FOR DEMONSTRATION PURPOSES ONLY
        this.reservations = [
            {
                id: 'demo-' + Date.now() + '-1',
                clientName: 'Demo Client One',
                clientEmail: 'demo.client1@example-demo.com',
                clientPhone: '(555) 000-0001',
                eventDate: nextWeek.toISOString().split('T')[0],
                eventTime: '18:00',
                eventType: 'wedding',
                eventDuration: 4,
                roomType: 'grand-hall',
                guestCount: 50,
                companyName: '',
                foodType: 'buffet-25',
                breakfastType: '',
                dessertType: '',
                beverageSelections: { 'bev-medalla': 2, 'bev-red-wine-30': 5 },
                entremsesesSelections: { 'entr-bandeja-surtido': 1 },
                additionalServices: { manteles: true, sillas: true },
                totalCost: 2850,
                depositPercentage: 20,
                depositAmount: 570,
                tipPercentage: 18,
                tipAmount: 513,
                createdAt: new Date().toISOString(),
                isDemo: true
            },
            {
                id: 'demo-' + Date.now() + '-2',
                clientName: 'Demo Client Two',
                clientEmail: 'demo.client2@example-demo.com',
                clientPhone: '(555) 000-0002',
                eventDate: twoWeeks.toISOString().split('T')[0],
                eventTime: '19:00',
                eventType: 'birthdays',
                eventDuration: 3,
                roomType: 'intimate-room',
                guestCount: 25,
                companyName: '',
                foodType: 'individual-plates',
                breakfastType: '',
                dessertType: 'postres',
                beverageSelections: { 'bev-heineken': 1, 'bev-white-wine-30': 3 },
                entremsesesSelections: { 'entr-media-bandeja': 1 },
                additionalServices: { manteles: true },
                totalCost: 1525,
                depositPercentage: 20,
                depositAmount: 305,
                tipPercentage: 15,
                tipAmount: 228.75,
                createdAt: new Date().toISOString(),
                isDemo: true
            },
            {
                id: 'demo-' + Date.now() + '-3',
                clientName: 'Demo Client Three',
                clientEmail: 'demo.client3@example-demo.com',
                clientPhone: '(555) 000-0003',
                eventDate: threeWeeks.toISOString().split('T')[0],
                eventTime: '17:00',
                eventType: 'pharmaceutical',
                eventDuration: 5,
                roomType: 'outdoor-terrace',
                guestCount: 80,
                companyName: 'Demo Company Inc.',
                foodType: 'buffet-30',
                breakfastType: 'desayuno-10.95',
                dessertType: '',
                beverageSelections: { 'bev-soft-drinks': 2, 'bev-water': 1 },
                entremsesesSelections: { 'entr-bandeja-cortes-frios': 1 },
                additionalServices: { manteles: true, mesas: true, sillas: true },
                totalCost: 4450,
                depositPercentage: 30,
                depositAmount: 1335,
                tipPercentage: 20,
                tipAmount: 890,
                createdAt: new Date().toISOString(),
                isDemo: true
            }
        ];
        this.saveReservationsToLocalStorage();
        console.log('🎭 Sample demo data loaded (ALL FICTIONAL):', this.reservations.length, 'reservations');
    }

    // Setup real-time Firestore listener
    setupFirestoreListener() {
        // Never setup Firestore listener in demo mode
        if (this.isDemoMode || !window.FIREBASE_LOADED || !window.firestore) return;

        const reservationsRef = window.firestore.collection('reservations');
        
        this.firebaseUnsubscribe = reservationsRef.onSnapshot((snapshot) => {
            const reservations = [];
            snapshot.forEach((doc) => {
                reservations.push(doc.data());
            });
            // Sort by date
            reservations.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
            this.reservations = reservations;
            this.displayReservations();
            this.updateDashboard();
            console.log('Reservations synced from Firestore:', reservations.length);
        }, (error) => {
            console.error('Firestore sync error:', error);
        });
    }

    // Initialize navigation
    initializeNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
                // Close mobile menu after selection
                this.closeMobileMenu();
            });
        });

        // Initialize mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (sidebar) {
            const isOpen = sidebar.classList.contains('mobile-open');
            sidebar.classList.toggle('mobile-open');
            if (overlay) {
                if (isOpen) {
                    overlay.classList.remove('active');
                } else {
                    overlay.classList.add('active');
                }
            }
        }
    }

    // Close mobile menu
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('mobileMenuOverlay');
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
    // Format phone number as user types
    formatPhoneNumber(input) {
        // Remove all non-numeric characters
        let value = input.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Format the phone number
        input.value = this.formatPhoneNumberString(value);
    }
    
    // Format phone number string
    formatPhoneNumberString(numbersOnly) {
        if (numbersOnly.length === 0) return '';
        
        if (numbersOnly.length <= 3) {
            return numbersOnly;
        } else if (numbersOnly.length <= 6) {
            return `(${numbersOnly.substring(0, 3)}) ${numbersOnly.substring(3)}`;
        } else {
            return `(${numbersOnly.substring(0, 3)}) ${numbersOnly.substring(3, 6)}-${numbersOnly.substring(6, 10)}`;
        }
    }

    // Show specific section
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;

        // Update content based on section
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'reservations':
                this.displayReservations();
                break;
            case 'calendar':
                this.displayCalendar();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Form inputs
        const form = document.getElementById('reservationForm');
        const guestCountSlider = document.getElementById('guestCount');
        const guestCountManual = document.getElementById('guestCountManual');
        const calculateBtn = document.getElementById('calculateBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        // Phone number formatting
        const clientPhone = document.getElementById('clientPhone');
        if (clientPhone) {
            clientPhone.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
            clientPhone.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numbersOnly = pastedText.replace(/\D/g, '');
                e.target.value = this.formatPhoneNumberString(numbersOnly);
            });
        }
        const openBeverageModalBtn = document.getElementById('openBeverageModalBtn');
        const editBeveragesBtn = document.getElementById('editBeveragesBtn');
        const beverageCloseBtn = document.getElementById('beverageCloseBtn');
        const beverageCancelBtn = document.getElementById('beverageCancelBtn');
        const beverageSaveBtn = document.getElementById('beverageSaveBtn');
        const openEntremesesModalBtn = document.getElementById('openEntremesesModalBtn');
        const editEntremesesBtn = document.getElementById('editEntremesesBtn');
        const entremesesCloseBtn = document.getElementById('entremesesCloseBtn');
        const entremesesCancelBtn = document.getElementById('entremesesCancelBtn');
        const entremesesSaveBtn = document.getElementById('entremesesSaveBtn');
        const entremesesClearBtn = document.getElementById('entremesesClearBtn');

        // Real-time updates for pricing
        const pricingInputs = [
            'roomType', 'foodType', 'breakfastType', 'dessertType', 'drinkType', 'eventDuration',
            'audioVisual', 'decorations', 'waitstaff', 'valet', 'tipPercentage', 'depositPercentage'
        ];

        pricingInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.addEventListener('change', () => this.calculatePrice());
                } else {
                    element.addEventListener('change', () => { this.calculatePrice(); this.updateFoodServiceSummary(); });
                }
            }
        });

        // Explicit event listeners for tip and deposit percentage to ensure they work
        const tipPercentageSelect = document.getElementById('tipPercentage');
        if (tipPercentageSelect) {
            tipPercentageSelect.addEventListener('change', () => {
                this.calculatePrice();
            });
        }

        const depositPercentageSelect = document.getElementById('depositPercentage');
        if (depositPercentageSelect) {
            depositPercentageSelect.addEventListener('change', () => {
                this.calculatePrice();
            });
        }

        // Buffet modal behavior
        const foodType = document.getElementById('foodType');
        foodType.addEventListener('change', () => {
            this.handleFoodTypeChange();
        });

        // Breakfast type behavior
        const breakfastType = document.getElementById('breakfastType');
        breakfastType?.addEventListener('change', () => {
            this.handleBreakfastTypeChange();
        });

        // Dessert type behavior
        const dessertType = document.getElementById('dessertType');
        dessertType?.addEventListener('change', () => {
            this.handleDessertTypeChange();
        });

        const buffetCloseBtn = document.getElementById('buffetCloseBtn');
        const buffetCancelBtn = document.getElementById('buffetCancelBtn');
        const buffetSaveBtn = document.getElementById('buffetSaveBtn');
        const editBuffetBtn = document.getElementById('editBuffetBtn');

        buffetCloseBtn?.addEventListener('click', () => this.closeBuffetModal());
        buffetCancelBtn?.addEventListener('click', () => {
            // reset foodType if cancel from initial open
            const ft = document.getElementById('foodType');
            if (ft && this.isBuffet(ft.value)) {
                ft.value = '';
            }
            this.clearBuffetSelections();
            this.closeBuffetModal();
            this.calculatePrice();
        });
        buffetSaveBtn?.addEventListener('click', () => {
            this.closeBuffetModal();
            this.calculatePrice();
            this.updateFoodServiceSummary();
        });
        editBuffetBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openBuffetModal();
        });

        // Breakfast modal behavior
        const breakfastCloseBtn = document.getElementById('breakfastCloseBtn');
        const breakfastCancelBtn = document.getElementById('breakfastCancelBtn');
        const breakfastSaveBtn = document.getElementById('breakfastSaveBtn');
        const editBreakfastBtn = document.getElementById('editBreakfastBtn');

        breakfastCloseBtn?.addEventListener('click', () => this.closeBreakfastModal());
        breakfastCancelBtn?.addEventListener('click', () => {
            // reset breakfastType if cancel from initial open
            const bt = document.getElementById('breakfastType');
            if (bt && this.isBreakfast(bt.value)) {
                bt.value = '';
            }
            this.clearBreakfastSelections();
            this.closeBreakfastModal();
            this.calculatePrice();
        });
        breakfastSaveBtn?.addEventListener('click', () => {
            this.closeBreakfastModal();
            this.calculatePrice();
            this.updateBreakfastServiceSummary();
        });
        editBreakfastBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openBreakfastModal();
        });

        // Clear breakfast selections button in modal
        const breakfastClearBtn = document.getElementById('breakfastClearBtn');
        breakfastClearBtn?.addEventListener('click', () => this.clearBreakfastSelectionsInModal());

        // Dessert modal behavior
        const dessertCloseBtn = document.getElementById('dessertCloseBtn');
        const dessertCancelBtn = document.getElementById('dessertCancelBtn');
        const dessertSaveBtn = document.getElementById('dessertSaveBtn');
        const editDessertBtn = document.getElementById('editDessertBtn');

        dessertCloseBtn?.addEventListener('click', () => this.closeDessertModal());
        dessertCancelBtn?.addEventListener('click', () => {
            // reset dessertType if cancel from initial open
            const dt = document.getElementById('dessertType');
            if (dt && this.isDessert(dt.value)) {
                dt.value = '';
            }
            this.clearDessertSelections();
            this.closeDessertModal();
            this.calculatePrice();
        });
        dessertSaveBtn?.addEventListener('click', () => {
            this.closeDessertModal();
            this.calculatePrice();
            this.updateDessertServiceSummary();
        });
        editDessertBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openDessertModal();
        });

        // Clear dessert selections button in modal
        const dessertClearBtn = document.getElementById('dessertClearBtn');
        dessertClearBtn?.addEventListener('click', () => this.clearDessertSelectionsInModal());

        // Guest count slider
        guestCountSlider.addEventListener('input', () => {
            this.updateGuestCountDisplay();
            this.syncGuestCountInputs();
            this.calculatePrice();
        });

        // Guest count manual input
        guestCountManual.addEventListener('input', () => {
            this.syncGuestCountFromManual();
            this.calculatePrice();
        });


        // Event type selection
        const eventType = document.getElementById('eventType');
        eventType?.addEventListener('change', () => {
            this.handleEventTypeChange();
        });


        // Beverage modal events
        openBeverageModalBtn?.addEventListener('click', () => this.openBeverageModal());
        editBeveragesBtn?.addEventListener('click', () => this.openBeverageModal());
        beverageCloseBtn?.addEventListener('click', () => this.closeBeverageModal());
        beverageCancelBtn?.addEventListener('click', () => this.closeBeverageModal());
        beverageSaveBtn?.addEventListener('click', () => {
            this.saveBeverageSelectionsFromModal();
            this.updateBeverageSummary();
            this.calculatePrice();
            this.closeBeverageModal();
        });
        
        // Entremeses modal events
        openEntremesesModalBtn?.addEventListener('click', () => this.openEntremesesModal());
        editEntremesesBtn?.addEventListener('click', () => this.openEntremesesModal());
        entremesesCloseBtn?.addEventListener('click', () => this.closeEntremesesModal());
        entremesesCancelBtn?.addEventListener('click', () => this.closeEntremesesModal());
        entremesesSaveBtn?.addEventListener('click', () => {
            this.saveEntremesesSelectionsFromModal();
            this.updateEntremesesSummary();
            this.calculatePrice();
            this.closeEntremesesModal();
        });
        entremesesClearBtn?.addEventListener('click', () => this.clearEntremesesSelectionsInModal());

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReservation();
        });

        // Reservation details modal events
        const reservationDetailsModal = document.getElementById('reservationDetailsModal');
        const reservationDetailsCloseBtn = document.getElementById('reservationDetailsCloseBtn');
        const reservationDetailsCloseBtn2 = document.getElementById('reservationDetailsCloseBtn2');
        reservationDetailsCloseBtn?.addEventListener('click', () => this.closeReservationDetailsModal());
        reservationDetailsCloseBtn2?.addEventListener('click', () => this.closeReservationDetailsModal());
        
        // Validation error modal events
        const validationErrorCloseBtn = document.getElementById('validationErrorCloseBtn');
        const validationErrorOkBtn = document.getElementById('validationErrorOkBtn');
        validationErrorCloseBtn?.addEventListener('click', () => this.closeValidationErrorModal());
        validationErrorOkBtn?.addEventListener('click', () => this.closeValidationErrorModal());
        
        // Close modal when clicking outside
        const validationErrorModal = document.getElementById('validationErrorModal');
        if (validationErrorModal) {
            validationErrorModal.addEventListener('click', (e) => {
                if (e.target === validationErrorModal) {
                    this.closeValidationErrorModal();
                }
            });
        }
        
        // Close modal when clicking outside
        reservationDetailsModal?.addEventListener('click', (e) => {
            if (e.target === reservationDetailsModal) {
                this.closeReservationDetailsModal();
            }
        });

        // Button events
        calculateBtn.addEventListener('click', () => this.calculatePrice());
        
        // Clear beverage selections button in modal
        const beverageClearBtn = document.getElementById('beverageClearBtn');
        beverageClearBtn?.addEventListener('click', () => this.clearBeverageSelectionsInModal());
        
        // Clear buffet selections button in modal
        const buffetClearBtn = document.getElementById('buffetClearBtn');
        buffetClearBtn?.addEventListener('click', () => this.clearBuffetSelectionsInModal());
    }

    // Launch modal when buffet is selected
    handleFoodTypeChange() {
        const foodType = document.getElementById('foodType');
        if (foodType && this.isBuffet(foodType.value)) {
            this.openBuffetModal();
        } else {
            this.clearBuffetSelections();
        }
        // Recalculate price to keep totals fresh
        this.calculatePrice();
        this.updateFoodServiceSummary();
    }

    // Launch modal when breakfast is selected
    handleBreakfastTypeChange() {
        const breakfastType = document.getElementById('breakfastType');
        if (breakfastType && this.isBreakfast(breakfastType.value)) {
            this.openBreakfastModal();
        } else {
            this.clearBreakfastSelections();
        }
        // Recalculate price to keep totals fresh
        this.calculatePrice();
        this.updateBreakfastServiceSummary();
    }

    handleDessertTypeChange() {
        const dessertType = document.getElementById('dessertType');
        if (dessertType && this.isDessert(dessertType.value)) {
            this.openDessertModal();
        } else {
            this.clearDessertSelections();
        }
        // Recalculate price to keep totals fresh
        this.calculatePrice();
        this.updateDessertServiceSummary();
    }

    openBuffetModal() {
        const modal = document.getElementById('buffetModal');
        if (!modal) return;
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeBuffetModal() {
        const modal = document.getElementById('buffetModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    clearBuffetSelections() {
        ['buffetRice','buffetRice2','buffetProtein1','buffetProtein2','buffetSide','buffetSalad','buffetSalad2']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const panecillosEl = document.getElementById('buffetPanecillos');
        if (panecillosEl) panecillosEl.checked = false;
        const aguaRefrescoEl = document.getElementById('buffetAguaRefresco');
        if (aguaRefrescoEl) aguaRefrescoEl.checked = false;
        const pastelesEl = document.getElementById('buffetPasteles');
        if (pastelesEl) pastelesEl.checked = false;
    }

    // Clear all beverage selections in the modal
    clearBeverageSelectionsInModal() {
        const map = {
            'bev-soft-drinks': 'soft-drinks',
            'bev-water': 'water',
            'bev-michelob': 'michelob',
            'bev-medalla': 'medalla',
            'bev-heineken': 'heineken',
            'bev-coors': 'coors',
            'bev-corona': 'corona',
            'bev-modelo': 'modelo',
            'bev-black-label-1l': 'black-label-1l',
            'bev-tito-1l': 'tito-1l',
            'bev-dewars-12-handle': 'dewars-12-handle',
            'bev-dewars-handle': 'dewars-handle',
            'bev-donq-cristal-handle': 'donq-cristal-handle',
            'bev-donq-limon-handle': 'donq-limon-handle',
            'bev-donq-passion-handle': 'donq-passion-handle',
            'bev-donq-coco-handle': 'donq-coco-handle',
            'bev-donq-naranja-handle': 'donq-naranja-handle',
            'bev-donq-oro-handle': 'donq-oro-handle',
            'bev-tito-handle': 'tito-handle',
            'bev-sangria': 'sangria',
            'bev-red-wine-25': 'red-wine-25',
            'bev-red-wine-30': 'red-wine-30',
            'bev-red-wine-35-1': 'red-wine-35-1',
            'bev-red-wine-35-2': 'red-wine-35-2',
            'bev-red-wine-40': 'red-wine-40',
            'bev-white-wine-25': 'white-wine-25',
            'bev-white-wine-30': 'white-wine-30',
            'bev-white-wine-35-1': 'white-wine-35-1',
            'bev-white-wine-35-2': 'white-wine-35-2',
            'bev-white-wine-40': 'white-wine-40',
            'bev-descorche': 'descorche',
        };
        
        // Clear all input fields and remove selected class
        Object.keys(map).forEach(inputId => {
            const el = document.getElementById(inputId);
            if (el) {
                el.value = 0;
                const wrapper = el.parentElement;
                if (wrapper) {
                    wrapper.classList.remove('selected');
                }
            }
        });
        
        // Clear Mimosa checkbox
        const mimosaCheckbox = document.getElementById('bev-mimosa');
        if (mimosaCheckbox) {
            mimosaCheckbox.checked = false;
        }
        
        // Clear the selections object
        this.beverageSelections = {};
    }

    // Clear all buffet selections in the modal
    clearBuffetSelectionsInModal() {
        this.clearBuffetSelections();
    }

    // Launch modal when breakfast is selected
    openBreakfastModal() {
        const modal = document.getElementById('breakfastModal');
        if (!modal) return;
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeBreakfastModal() {
        const modal = document.getElementById('breakfastModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    openDessertModal() {
        const modal = document.getElementById('dessertModal');
        if (!modal) return;
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeDessertModal() {
        const modal = document.getElementById('dessertModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    clearBreakfastSelections() {
        const cafeEl = document.getElementById('breakfastCafe');
        if (cafeEl) cafeEl.checked = false;
        const jugoEl = document.getElementById('breakfastJugo');
        if (jugoEl) jugoEl.checked = false;
        const avenaEl = document.getElementById('breakfastAvena');
        if (avenaEl) avenaEl.checked = false;
        const wrapJamonQuesoEl = document.getElementById('breakfastWrapJamonQueso');
        if (wrapJamonQuesoEl) wrapJamonQuesoEl.checked = false;
        const bocadilloJamonQuesoEl = document.getElementById('breakfastBocadilloJamonQueso');
        if (bocadilloJamonQuesoEl) bocadilloJamonQuesoEl.checked = false;
    }

    // Clear all breakfast selections in the modal
    clearBreakfastSelectionsInModal() {
        this.clearBreakfastSelections();
    }

    clearDessertSelections() {
        const flanQuesoEl = document.getElementById('dessertFlanQueso');
        if (flanQuesoEl) flanQuesoEl.checked = false;
        const flanVainillaEl = document.getElementById('dessertFlanVainilla');
        if (flanVainillaEl) flanVainillaEl.checked = false;
        const flanCocoEl = document.getElementById('dessertFlanCoco');
        if (flanCocoEl) flanCocoEl.checked = false;
        const cheesecakeEl = document.getElementById('dessertCheesecake');
        if (cheesecakeEl) cheesecakeEl.checked = false;
        const bizcochoChocolateEl = document.getElementById('dessertBizcochoChocolate');
        if (bizcochoChocolateEl) bizcochoChocolateEl.checked = false;
        const bizcochoZanahoriaEl = document.getElementById('dessertBizcochoZanahoria');
        if (bizcochoZanahoriaEl) bizcochoZanahoriaEl.checked = false;
        const tresLechesEl = document.getElementById('dessertTresLeches');
        if (tresLechesEl) tresLechesEl.checked = false;
        const temblequeEl = document.getElementById('dessertTembleque');
        if (temblequeEl) temblequeEl.checked = false;
        const postresSurtidosEl = document.getElementById('dessertPostresSurtidos');
        if (postresSurtidosEl) postresSurtidosEl.checked = false;
    }

    // Clear all dessert selections in the modal
    clearDessertSelectionsInModal() {
        this.clearDessertSelections();
    }

    // Build and render Food & Beverage summary (buffet only)
    updateFoodServiceSummary() {
        const container = document.getElementById('foodServiceSummary');
        const editBuffetBtn = document.getElementById('editBuffetBtn');
        if (!container) return;

        const foodTypeEl = document.getElementById('foodType');
        const foodType = foodTypeEl?.value || '';
        
        if (this.isBuffet(foodType)) {
            const rice = document.getElementById('buffetRice');
            const rice2 = document.getElementById('buffetRice2');
            const p1 = document.getElementById('buffetProtein1');
            const p2 = document.getElementById('buffetProtein2');
            const side = document.getElementById('buffetSide');
            const salad = document.getElementById('buffetSalad');
            const salad2 = document.getElementById('buffetSalad2');
            const panecillos = document.getElementById('buffetPanecillos');
            const aguaRefresco = document.getElementById('buffetAguaRefresco');
            const pasteles = document.getElementById('buffetPasteles');

            const items = [];
            if (rice?.value) items.push(`<li>Arroz: ${rice.selectedOptions[0].text}</li>`);
            if (rice2?.value) items.push(`<li>${rice2.selectedOptions[0].text}</li>`);
            if (p1?.value) items.push(`<li>Proteína 1: ${p1.selectedOptions[0].text}</li>`);
            if (p2?.value) items.push(`<li>Proteína 2: ${p2.selectedOptions[0].text}</li>`);
            if (side?.value) items.push(`<li>Complemento: ${side.selectedOptions[0].text}</li>`);
            if (salad?.value) items.push(`<li>Ensalada 1: ${salad.selectedOptions[0].text}</li>`);
            if (salad2?.value) items.push(`<li>Ensalada 2: ${salad2.selectedOptions[0].text}</li>`);
            if (panecillos?.checked) items.push(`<li>Panecillos</li>`);
            if (aguaRefresco?.checked) items.push(`<li>Agua y/o Refresco</li>`);
            if (pasteles?.checked) items.push(`<li>Pasteles</li>`);

            container.classList.remove('hidden');
            editBuffetBtn?.classList.remove('hidden');
            container.innerHTML = items.length
                ? `<ul>${items.join('')}</ul>`
                : '<em>Seleccione opciones del buffet y haga clic en Save.</em>';
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBuffetBtn?.classList.add('hidden');
        }
    }

    // Build and render Breakfast summary
    updateBreakfastServiceSummary() {
        const container = document.getElementById('breakfastServiceSummary');
        const editBreakfastBtn = document.getElementById('editBreakfastBtn');
        if (!container) return;

        const breakfastTypeEl = document.getElementById('breakfastType');
        const breakfastType = breakfastTypeEl?.value || '';
        
        if (this.isBreakfast(breakfastType)) {
            const cafe = document.getElementById('breakfastCafe');
            const jugo = document.getElementById('breakfastJugo');
            const avena = document.getElementById('breakfastAvena');
            const wrapJamonQueso = document.getElementById('breakfastWrapJamonQueso');
            const bocadilloJamonQueso = document.getElementById('breakfastBocadilloJamonQueso');

            const items = [];
            if (cafe?.checked) items.push(`<li>Café</li>`);
            if (jugo?.checked) items.push(`<li>Jugo</li>`);
            if (avena?.checked) items.push(`<li>Avena</li>`);
            if (wrapJamonQueso?.checked) items.push(`<li>Wrap de Jamón y Queso</li>`);
            if (bocadilloJamonQueso?.checked) items.push(`<li>Bocadillo de Jamón y Queso</li>`);

            container.classList.remove('hidden');
            editBreakfastBtn?.classList.remove('hidden');
            container.innerHTML = items.length
                ? `<ul>${items.join('')}</ul>`
                : '<em>Seleccione opciones del desayuno y haga clic en Save.</em>';
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBreakfastBtn?.classList.add('hidden');
        }
    }

    updateDessertServiceSummary() {
        const container = document.getElementById('dessertServiceSummary');
        const editDessertBtn = document.getElementById('editDessertBtn');
        if (!container) return;

        const dessertTypeEl = document.getElementById('dessertType');
        const dessertType = dessertTypeEl?.value || '';
        
        if (this.isDessert(dessertType)) {
            const flanQueso = document.getElementById('dessertFlanQueso');
            const flanVainilla = document.getElementById('dessertFlanVainilla');
            const flanCoco = document.getElementById('dessertFlanCoco');
            const cheesecake = document.getElementById('dessertCheesecake');
            const bizcochoChocolate = document.getElementById('dessertBizcochoChocolate');
            const bizcochoZanahoria = document.getElementById('dessertBizcochoZanahoria');
            const tresLeches = document.getElementById('dessertTresLeches');
            const tembleque = document.getElementById('dessertTembleque');
            const postresSurtidos = document.getElementById('dessertPostresSurtidos');

            const items = [];
            if (flanQueso?.checked) items.push(`<li>Flan de Queso</li>`);
            if (flanVainilla?.checked) items.push(`<li>Flan de Vainilla</li>`);
            if (flanCoco?.checked) items.push(`<li>Flan de Coco</li>`);
            if (cheesecake?.checked) items.push(`<li>Cheesecake</li>`);
            if (bizcochoChocolate?.checked) items.push(`<li>Bizcocho de Chocolate</li>`);
            if (bizcochoZanahoria?.checked) items.push(`<li>Bizcocho de Zanahoria</li>`);
            if (tresLeches?.checked) items.push(`<li>Tres Leches</li>`);
            if (tembleque?.checked) items.push(`<li>Tembleque</li>`);
            if (postresSurtidos?.checked) items.push(`<li>Postres Surtidos</li>`);

            container.classList.remove('hidden');
            editDessertBtn?.classList.remove('hidden');
            container.innerHTML = items.length
                ? `<ul>${items.join('')}</ul>`
                : '<em>Seleccione opciones de postres y haga clic en Save.</em>';
        } else {
            container.classList.add('hidden');
            container.innerHTML = '';
            editDessertBtn?.classList.add('hidden');
        }
    }

    // ----- Beverages modal helpers -----
    getBeverageItems() {
        return [
            // Non-alcoholic
            { id: 'soft-drinks', name: 'Caja de Refrescos (24)', price: 35, alcohol: false },
            { id: 'water', name: 'Caja de Agua (24)', price: 20, alcohol: false },
            // Beers
            { id: 'michelob', name: 'Michelob', price: 72, alcohol: true },
            { id: 'medalla', name: 'Medalla', price: 72, alcohol: true },
            { id: 'heineken', name: 'Heineken', price: 72, alcohol: true },
            { id: 'coors', name: 'Coors Light', price: 72, alcohol: true },
            { id: 'corona', name: 'Corona', price: 72, alcohol: true },
            { id: 'modelo', name: 'Modelo', price: 72, alcohol: true },
            // Liquors
            { id: 'black-label-1l', name: '1 Litro Black Label', price: 65, alcohol: true },
            { id: 'tito-1l', name: '1 Litro Tito Vodka', price: 45, alcohol: true },
            { id: 'dewars-12-handle', name: 'Gancho Dewars 12', price: 200, alcohol: true },
            { id: 'dewars-handle', name: 'Gancho Dewars Reg.', price: 150, alcohol: true },
            { id: 'donq-cristal-handle', name: 'Gancho Don Q Cristal', price: 75, alcohol: true },
            { id: 'donq-limon-handle', name: 'Gancho Don Q Limón', price: 75, alcohol: true },
            { id: 'donq-passion-handle', name: 'Gancho Don Q Passion', price: 75, alcohol: true },
            { id: 'donq-coco-handle', name: 'Gancho Don Q Coco', price: 75, alcohol: true },
            { id: 'donq-naranja-handle', name: 'Gancho Don Q Naranja', price: 75, alcohol: true },
            { id: 'donq-oro-handle', name: 'Gancho Don Q Oro', price: 75, alcohol: true },
            { id: 'tito-handle', name: 'Gancho Tito Vodka', price: 150, alcohol: true },
            { id: 'sangria', name: 'Jarra de Sangria', price: 25, alcohol: true },
            // Wines
            { id: 'red-wine-25', name: 'Botella de Vino Tinto ($25)', price: 25, alcohol: true },
            { id: 'red-wine-30', name: 'Botella de Vino Tinto ($30)', price: 30, alcohol: true },
            { id: 'red-wine-35-1', name: 'Botella de Vino Tinto ($35)', price: 35, alcohol: true },
            { id: 'red-wine-35-2', name: 'Botella de Vino Tinto ($35)', price: 35, alcohol: true },
            { id: 'red-wine-40', name: 'Botella de Vino Tinto ($40)', price: 40, alcohol: true },
            { id: 'white-wine-25', name: 'Botella de Vino Blanco ($25)', price: 25, alcohol: true },
            { id: 'white-wine-30', name: 'Botella de Vino Blanco ($30)', price: 30, alcohol: true },
            { id: 'white-wine-35-1', name: 'Botella de Vino Blanco ($35)', price: 35, alcohol: true },
            { id: 'white-wine-35-2', name: 'Botella de Vino Blanco ($35)', price: 35, alcohol: true },
            { id: 'white-wine-40', name: 'Botella de Vino Blanco ($40)', price: 40, alcohol: true },
            { id: 'descorche', name: 'Descorche', price: 0, alcohol: false },
        ];
    }

    openBeverageModal() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        // Prefill inputs from current selections
        const map = {
            'bev-soft-drinks': 'soft-drinks',
            'bev-water': 'water',
            'bev-michelob': 'michelob',
            'bev-medalla': 'medalla',
            'bev-heineken': 'heineken',
            'bev-coors': 'coors',
            'bev-corona': 'corona',
            'bev-modelo': 'modelo',
            'bev-black-label-1l': 'black-label-1l',
            'bev-tito-1l': 'tito-1l',
            'bev-dewars-12-handle': 'dewars-12-handle',
            'bev-dewars-handle': 'dewars-handle',
            'bev-donq-cristal-handle': 'donq-cristal-handle',
            'bev-donq-limon-handle': 'donq-limon-handle',
            'bev-donq-passion-handle': 'donq-passion-handle',
            'bev-donq-coco-handle': 'donq-coco-handle',
            'bev-donq-naranja-handle': 'donq-naranja-handle',
            'bev-donq-oro-handle': 'donq-oro-handle',
            'bev-tito-handle': 'tito-handle',
            'bev-sangria': 'sangria',
            'bev-red-wine-25': 'red-wine-25',
            'bev-red-wine-30': 'red-wine-30',
            'bev-red-wine-35-1': 'red-wine-35-1',
            'bev-red-wine-35-2': 'red-wine-35-2',
            'bev-red-wine-40': 'red-wine-40',
            'bev-white-wine-25': 'white-wine-25',
            'bev-white-wine-30': 'white-wine-30',
            'bev-white-wine-35-1': 'white-wine-35-1',
            'bev-white-wine-35-2': 'white-wine-35-2',
            'bev-white-wine-40': 'white-wine-40',
            'bev-descorche': 'descorche',
        };
        Object.entries(map).forEach(([inputId, key]) => {
            const el = document.getElementById(inputId);
            if (el) {
                const qty = this.beverageSelections[key] || 0;
                el.value = qty;
                const wrapper = el.parentElement;
                if (wrapper) {
                    if (qty > 0) wrapper.classList.add('selected');
                    else wrapper.classList.remove('selected');
                }
            }
        });
        // Handle Mimosa checkbox
        const mimosaCheckbox = document.getElementById('bev-mimosa');
        if (mimosaCheckbox) {
            mimosaCheckbox.checked = this.beverageSelections['mimosa'] === true;
        }
        // Attach change handlers for selection animation
        this.attachBeverageInputHandlers();
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeBeverageModal() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    saveBeverageSelectionsFromModal() {
        const inputs = [
            { inputId: 'bev-soft-drinks', key: 'soft-drinks' },
            { inputId: 'bev-water', key: 'water' },
            { inputId: 'bev-michelob', key: 'michelob' },
            { inputId: 'bev-medalla', key: 'medalla' },
            { inputId: 'bev-heineken', key: 'heineken' },
            { inputId: 'bev-coors', key: 'coors' },
            { inputId: 'bev-corona', key: 'corona' },
            { inputId: 'bev-modelo', key: 'modelo' },
            { inputId: 'bev-black-label-1l', key: 'black-label-1l' },
            { inputId: 'bev-tito-1l', key: 'tito-1l' },
            { inputId: 'bev-dewars-12-handle', key: 'dewars-12-handle' },
            { inputId: 'bev-dewars-handle', key: 'dewars-handle' },
            { inputId: 'bev-donq-cristal-handle', key: 'donq-cristal-handle' },
            { inputId: 'bev-donq-limon-handle', key: 'donq-limon-handle' },
            { inputId: 'bev-donq-passion-handle', key: 'donq-passion-handle' },
            { inputId: 'bev-donq-coco-handle', key: 'donq-coco-handle' },
            { inputId: 'bev-donq-naranja-handle', key: 'donq-naranja-handle' },
            { inputId: 'bev-donq-oro-handle', key: 'donq-oro-handle' },
            { inputId: 'bev-tito-handle', key: 'tito-handle' },
            { inputId: 'bev-sangria', key: 'sangria' },
            { inputId: 'bev-red-wine-25', key: 'red-wine-25' },
            { inputId: 'bev-red-wine-30', key: 'red-wine-30' },
            { inputId: 'bev-red-wine-35-1', key: 'red-wine-35-1' },
            { inputId: 'bev-red-wine-35-2', key: 'red-wine-35-2' },
            { inputId: 'bev-red-wine-40', key: 'red-wine-40' },
            { inputId: 'bev-white-wine-25', key: 'white-wine-25' },
            { inputId: 'bev-white-wine-30', key: 'white-wine-30' },
            { inputId: 'bev-white-wine-35-1', key: 'white-wine-35-1' },
            { inputId: 'bev-white-wine-35-2', key: 'white-wine-35-2' },
            { inputId: 'bev-white-wine-40', key: 'white-wine-40' },
            { inputId: 'bev-descorche', key: 'descorche' },
        ];
        const selections = {};
        inputs.forEach(({ inputId, key }) => {
            const el = document.getElementById(inputId);
            const qty = parseInt(el?.value) || 0;
            if (qty > 0) selections[key] = qty;
        });
        // Handle Mimosa checkbox
        const mimosaCheckbox = document.getElementById('bev-mimosa');
        if (mimosaCheckbox && mimosaCheckbox.checked) {
            selections['mimosa'] = true;
        }
        this.beverageSelections = selections;
    }

    updateBeverageSummary() {
        const container = document.getElementById('beverageSummary');
        const editBtn = document.getElementById('editBeveragesBtn');
        const selectBtn = document.getElementById('openBeverageModalBtn');
        if (!container) return;
        const beverages = this.getBeverageItems();
        const items = [];
        
        // Add regular beverage items (with quantities)
        Object.entries(this.beverageSelections).forEach(([id, qty]) => {
            if (id === 'mimosa') return; // Handle Mimosa separately
            if (qty > 0) {
                const item = beverages.find(b => b.id === id);
                const label = item ? item.name : id;
                items.push(`<li>${label}: ${qty}</li>`);
            }
        });
        
        // Add Mimosa if checked
        if (this.beverageSelections['mimosa'] === true) {
            items.push(`<li>Mimosa ($3.95 por persona)</li>`);
        }
        
        if (items.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBtn?.classList.add('hidden');
            selectBtn?.classList.remove('hidden');
            return;
        }
        container.classList.remove('hidden');
        editBtn?.classList.remove('hidden');
        selectBtn?.classList.add('hidden');
        container.innerHTML = `<ul>${items.join('')}</ul>`;
    }

    // ----- Entremeses modal helpers -----
    getEntremesesItems() {
        return [
            { id: 'bandeja-surtido', name: 'Bandeja de Surtido', price: 100 },
            { id: 'media-bandeja', name: 'Media Bandeja de Surtidos', price: 50 },
            { id: 'bandeja-cortes-frios', name: 'Bandeja Cortes Frios', price: 150 },
            { id: 'platos-entremeses', name: 'Platos de Entremeses', price: 20 },
        ];
    }

    openEntremesesModal() {
        const modal = document.getElementById('entremesesModal');
        if (!modal) return;
        // Prefill inputs from current selections
        const map = {
            'entr-bandeja-surtido': 'bandeja-surtido',
            'entr-media-bandeja': 'media-bandeja',
            'entr-bandeja-cortes-frios': 'bandeja-cortes-frios',
            'entr-platos-entremeses': 'platos-entremeses',
        };
        Object.entries(map).forEach(([inputId, key]) => {
            const el = document.getElementById(inputId);
            if (el) {
                const qty = this.entremesesSelections[key] || 0;
                el.value = qty;
                const quantitySelector = el.parentElement;
                const wrapper = quantitySelector ? quantitySelector.parentElement : null;
                if (wrapper) {
                    if (qty > 0) wrapper.classList.add('selected');
                    else wrapper.classList.remove('selected');
                }
            }
        });
        // Handle Asopao checkbox
        const asopaoCheckbox = document.getElementById('entr-asopao');
        if (asopaoCheckbox) {
            asopaoCheckbox.checked = this.entremesesSelections['asopao'] === true;
        }
        // Handle Ceviche checkbox
        const cevicheCheckbox = document.getElementById('entr-ceviche');
        if (cevicheCheckbox) {
            cevicheCheckbox.checked = this.entremesesSelections['ceviche'] === true;
        }
        // Attach handlers for plus/minus buttons
        this.attachEntremesesInputHandlers();
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeEntremesesModal() {
        const modal = document.getElementById('entremesesModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    saveEntremesesSelectionsFromModal() {
        const inputs = [
            { inputId: 'entr-bandeja-surtido', key: 'bandeja-surtido' },
            { inputId: 'entr-media-bandeja', key: 'media-bandeja' },
            { inputId: 'entr-bandeja-cortes-frios', key: 'bandeja-cortes-frios' },
            { inputId: 'entr-platos-entremeses', key: 'platos-entremeses' },
        ];
        const selections = {};
        inputs.forEach(({ inputId, key }) => {
            const el = document.getElementById(inputId);
            const qty = parseInt(el?.value) || 0;
            if (qty > 0) selections[key] = qty;
        });
        // Handle Asopao checkbox
        const asopaoCheckbox = document.getElementById('entr-asopao');
        if (asopaoCheckbox && asopaoCheckbox.checked) {
            selections['asopao'] = true;
        }
        // Handle Ceviche checkbox
        const cevicheCheckbox = document.getElementById('entr-ceviche');
        if (cevicheCheckbox && cevicheCheckbox.checked) {
            selections['ceviche'] = true;
        }
        this.entremesesSelections = selections;
    }

    updateEntremesesSummary() {
        const container = document.getElementById('entremesesSummary');
        const editBtn = document.getElementById('editEntremesesBtn');
        const selectBtn = document.getElementById('openEntremesesModalBtn');
        if (!container) return;
        const entremeses = this.getEntremesesItems();
        const items = [];
        
        // Add regular entremeses items (with quantities)
        Object.entries(this.entremesesSelections).forEach(([id, qty]) => {
            if (id === 'asopao' || id === 'ceviche') return; // Handle per-person items separately
            if (qty > 0) {
                const item = entremeses.find(e => e.id === id);
                const label = item ? item.name : id;
                items.push(`<li>${label}: ${qty}</li>`);
            }
        });
        
        // Add Asopao if checked
        if (this.entremesesSelections['asopao'] === true) {
            items.push(`<li>Asopao ($3.00 por persona)</li>`);
        }
        // Add Ceviche if checked
        if (this.entremesesSelections['ceviche'] === true) {
            items.push(`<li>Ceviche ($3.95 por persona)</li>`);
        }
        
        if (items.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBtn?.classList.add('hidden');
            selectBtn?.classList.remove('hidden');
            return;
        }
        container.classList.remove('hidden');
        editBtn?.classList.remove('hidden');
        selectBtn?.classList.add('hidden');
        container.innerHTML = `<ul>${items.join('')}</ul>`;
    }

    clearEntremesesSelectionsInModal() {
        const map = {
            'entr-bandeja-surtido': 'bandeja-surtido',
            'entr-media-bandeja': 'media-bandeja',
            'entr-bandeja-cortes-frios': 'bandeja-cortes-frios',
            'entr-platos-entremeses': 'platos-entremeses',
        };
        
        // Clear all input fields and remove selected class
        Object.keys(map).forEach(inputId => {
            const el = document.getElementById(inputId);
            if (el) {
                el.value = 0;
                const quantitySelector = el.parentElement;
                const wrapper = quantitySelector ? quantitySelector.parentElement : null;
                if (wrapper) {
                    wrapper.classList.remove('selected');
                }
            }
        });
        
        // Clear Asopao checkbox
        const asopaoCheckbox = document.getElementById('entr-asopao');
        if (asopaoCheckbox) {
            asopaoCheckbox.checked = false;
        }
        // Clear Ceviche checkbox
        const cevicheCheckbox = document.getElementById('entr-ceviche');
        if (cevicheCheckbox) {
            cevicheCheckbox.checked = false;
        }
        
        // Clear the selections object
        this.entremesesSelections = {};
    }
    
    attachEntremesesInputHandlers() {
        const modal = document.getElementById('entremesesModal');
        if (!modal) return;
        
        // Handle plus/minus buttons
        const plusButtons = modal.querySelectorAll('.quantity-plus[data-entremes]');
        const minusButtons = modal.querySelectorAll('.quantity-minus[data-entremes]');
        
        plusButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const entremesId = btn.getAttribute('data-entremes');
                const input = document.getElementById(entremesId);
                if (input) {
                    let currentValue = parseInt(input.value) || 0;
                    input.value = currentValue + 1;
                    this.updateEntremesesSelectionState(input);
                }
            });
        });
        
        minusButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const entremesId = btn.getAttribute('data-entremes');
                const input = document.getElementById(entremesId);
                if (input) {
                    let currentValue = parseInt(input.value) || 0;
                    if (currentValue > 0) {
                        input.value = currentValue - 1;
                        this.updateEntremesesSelectionState(input);
                    }
                }
            });
        });
        
        // Keep input handlers for any edge cases (though inputs are now readonly)
        const numberInputs = modal.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.oninput = () => {
                const qty = parseInt(input.value) || 0;
                if (qty < 0) input.value = 0;
                this.updateEntremesesSelectionState(input);
            };
        });
    }
    
    updateEntremesesSelectionState(input) {
        const qty = parseInt(input.value) || 0;
        // Find the wrapper div (parent of quantity-selector, which is parent of input)
        const quantitySelector = input.parentElement;
        const wrapper = quantitySelector ? quantitySelector.parentElement : null;
        
        if (!wrapper) return;
        
        if (qty > 0) {
            if (!wrapper.classList.contains('selected')) {
                wrapper.classList.add('selected', 'just-selected');
                setTimeout(() => wrapper.classList.remove('just-selected'), 650);
            }
        } else {
            wrapper.classList.remove('selected');
        }
    }

    attachBeverageInputHandlers() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        
        // Use event delegation to avoid duplicate listeners
        // Check if handlers are already attached
        if (modal.dataset.handlersAttached === 'true') return;
        
        // Use event delegation on the modal for plus/minus buttons
        modal.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('quantity-plus')) {
                e.preventDefault();
                e.stopPropagation();
                const beverageId = target.getAttribute('data-beverage');
                const input = document.getElementById(beverageId);
                if (input) {
                    let currentValue = parseInt(input.value) || 0;
                    input.value = currentValue + 1;
                    this.updateBeverageSelectionState(input);
                }
            } else if (target.classList.contains('quantity-minus')) {
                e.preventDefault();
                e.stopPropagation();
                const beverageId = target.getAttribute('data-beverage');
                const input = document.getElementById(beverageId);
                if (input) {
                    let currentValue = parseInt(input.value) || 0;
                    if (currentValue > 0) {
                        input.value = currentValue - 1;
                        this.updateBeverageSelectionState(input);
                    }
                }
            }
        });
        
        // Keep input handlers for any edge cases (though inputs are now readonly)
        const numberInputs = modal.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.oninput = () => {
                const qty = parseInt(input.value) || 0;
                if (qty < 0) input.value = 0;
                this.updateBeverageSelectionState(input);
            };
        });
        
        // Mark handlers as attached
        modal.dataset.handlersAttached = 'true';
    }
    
    updateBeverageSelectionState(input) {
        const qty = parseInt(input.value) || 0;
        // Find the wrapper div (parent of quantity-selector, which is parent of input)
        const quantitySelector = input.parentElement;
        const wrapper = quantitySelector ? quantitySelector.parentElement : null;
        
        if (!wrapper) return;
        
        if (qty > 0) {
            if (!wrapper.classList.contains('selected')) {
                wrapper.classList.add('selected', 'just-selected');
                setTimeout(() => wrapper.classList.remove('just-selected'), 650);
            }
        } else {
            wrapper.classList.remove('selected');
        }
    }

    // Stable accordion animation (height transition with JS)
    attachStableAccordionAnimation() {}

    // helpers
    isBuffet(value) {
        return typeof value === 'string' && value.startsWith('buffet');
    }

    isBreakfast(value) {
        return typeof value === 'string' && value.startsWith('desayuno');
    }

    isDessert(value) {
        return typeof value === 'string' && value === 'postres';
    }

    // Convert 24-hour time to 12-hour format
    formatTime12Hour(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Update guest count display
    updateGuestCountDisplay() {
        const slider = document.getElementById('guestCount');
        const display = document.getElementById('guestCountValue');
        display.textContent = slider.value;
    }

    // Sync guest count inputs (slider to manual input)
    syncGuestCountInputs() {
        const slider = document.getElementById('guestCount');
        const manualInput = document.getElementById('guestCountManual');
        manualInput.value = slider.value;
    }

    // Sync guest count from manual input to slider
    syncGuestCountFromManual() {
        const manualInput = document.getElementById('guestCountManual');
        const slider = document.getElementById('guestCount');
        const display = document.getElementById('guestCountValue');
        
        let value = parseInt(manualInput.value);
        
        // Allow empty field while typing - only validate when there's a value
        if (manualInput.value === '' || isNaN(value)) {
            // Don't update slider or display if field is empty - allow user to clear it
            return;
        }
        
        // Validate and constrain the value only if it's entered
        if (value < 1) {
            value = 1;
        } else if (value > 500) {
            value = 500;
        }
        
        // Update manual input with validated value
        manualInput.value = value;
        
        // Update slider (round to nearest 10 for slider)
        const sliderValue = Math.round(value / 10) * 10;
        slider.value = sliderValue;
        
        // Update display
        display.textContent = value;
    }

    calculateTables() {
        const guestCountManual = document.getElementById('guestCountManual');
        const tableType = document.getElementById('tableType');
        const tableCalculation = document.getElementById('tableCalculation');
        const calculatedTableCount = document.getElementById('calculatedTableCount');
        
        if (!guestCountManual || !tableType || !tableCalculation || !calculatedTableCount) return;
        
        const guestCount = parseInt(guestCountManual.value) || parseInt(document.getElementById('guestCount')?.value) || 0;
        const tableValue = tableType.value || '';
        
        // Parse table type and seats from value like "round-8" or "rectangular-10"
        const parts = tableValue.split('-');
        if (parts.length === 2) {
            const seats = parseInt(parts[1]) || 0;
            
            if (guestCount > 0 && seats > 0) {
                const tableCount = Math.ceil(guestCount / seats);
                calculatedTableCount.textContent = tableCount;
                tableCalculation.classList.remove('hidden');
            } else {
                tableCalculation.classList.add('hidden');
            }
        } else {
            tableCalculation.classList.add('hidden');
        }
    }
    
    parseTableConfiguration(tableValue) {
        if (!tableValue) return { tableType: null, seatsPerTable: null };
        
        const parts = tableValue.split('-');
        if (parts.length === 2) {
            return {
                tableType: parts[0], // 'round' or 'rectangular'
                seatsPerTable: parseInt(parts[1]) || null
            };
        }
        return { tableType: null, seatsPerTable: null };
    }
    
    formatTableConfiguration(tableType, seatsPerTable) {
        if (!tableType || !seatsPerTable) return '';
        return `${tableType}-${seatsPerTable}`;
    }
    
    calculateTableCount(guestCount, seatsPerTable) {
        if (guestCount > 0 && seatsPerTable > 0) {
            return Math.ceil(guestCount / seatsPerTable);
        }
        return 0;
    }

    handleEventTypeChange() {
        const eventType = document.getElementById('eventType');
        const otherEventTypeGroup = document.getElementById('otherEventTypeGroup');
        const otherEventType = document.getElementById('otherEventType');
        
        if (eventType.value === 'other') {
            otherEventTypeGroup.classList.remove('hidden');
            otherEventType.required = true;
        } else {
            otherEventTypeGroup.classList.add('hidden');
            otherEventType.required = false;
            otherEventType.value = '';
        }
    }


    // Calculate pricing in real-time
    calculatePrice() {
        const guestCountManual = document.getElementById('guestCountManual');
        const guestCount = parseInt(guestCountManual.value) || parseInt(document.getElementById('guestCount').value);
        const roomType = document.getElementById('roomType');
        const foodType = document.getElementById('foodType');
        const eventDuration = parseInt(document.getElementById('eventDuration').value) || 1;

        // Room cost - event spaces are now free (no cost)
        const roomCost = 0;

        // Food cost
        const foodPrice = foodType.selectedOptions[0]?.dataset.price || 0;
        const foodCost = parseFloat(foodPrice) * guestCount;

        // Breakfast cost (separate from food cost)
        const breakfastType = document.getElementById('breakfastType');
        const breakfastPrice = breakfastType?.selectedOptions[0]?.dataset.price || 0;
        const breakfastCost = parseFloat(breakfastPrice) * guestCount;

        // Drink cost
        // Beverage cost from selections
        const beverages = this.getBeverageItems();
        let drinkCost = 0;
        let alcoholicQty = 0;
        Object.entries(this.beverageSelections).forEach(([id, qty]) => {
            // Handle Mimosa separately - it's per person
            if (id === 'mimosa' && qty === true) {
                drinkCost += 3.95 * guestCount;
            } else {
                const item = beverages.find(b => b.id === id);
                if (item && qty > 0) {
                    drinkCost += item.price * qty;
                    if (item.alcohol) alcoholicQty += qty;
                }
            }
        });

        // Calculate entremeses cost
        const entremeses = this.getEntremesesItems();
        let entremesesCost = 0;
        Object.entries(this.entremesesSelections).forEach(([id, qty]) => {
            // Handle Asopao and Ceviche separately - they're per person
            if (id === 'asopao' && qty === true) {
                entremesesCost += 3.00 * guestCount;
            } else if (id === 'ceviche' && qty === true) {
                entremesesCost += 3.95 * guestCount;
            } else {
                const item = entremeses.find(e => e.id === id);
                if (item && qty > 0) {
                    entremesesCost += item.price * qty;
                }
            }
        });

        // Taxes (apply only to food, breakfast, entremeses, and alcoholic beverages)
        const isAlcoholic = alcoholicQty > 0;
        const totalFoodCost = foodCost + breakfastCost + entremesesCost; // Combine food, breakfast, and entremeses for tax calculation
        const foodStateReducedTax = totalFoodCost * 0.06; // 6%
        const foodCityTax = totalFoodCost * 0.01; // 1%
        const alcoholStateTax = isAlcoholic ? drinkCost * 0.105 : 0; // 10.5%

        // Additional services cost
        const servicePrices = {
            'audioVisual': 0, // Manteles has no cost
            'sillas': 0,
            'mesas': 0,
            'decorations': 150,
            'waitstaff': 100,
            'valet': 50
        };
        
        const additionalServices = ['audioVisual', 'sillas', 'mesas', 'decorations', 'waitstaff', 'valet'];
        let additionalCost = 0;
        
        additionalServices.forEach(service => {
            const checkbox = document.getElementById(service);
            if (checkbox && checkbox.checked) {
                additionalCost += servicePrices[service] || 0;
            }
        });

        // Update display
        document.getElementById('roomCost').textContent = `$${roomCost.toFixed(2)}`;
        document.getElementById('foodCost').textContent = `$${foodCost.toFixed(2)}`;
        document.getElementById('breakfastCost').textContent = `$${breakfastCost.toFixed(2)}`;
        document.getElementById('drinkCost').textContent = `$${drinkCost.toFixed(2)}`;
        document.getElementById('entremesesCost').textContent = `$${entremesesCost.toFixed(2)}`;
        document.getElementById('foodStateReducedTax').textContent = `$${foodStateReducedTax.toFixed(2)}`;
        document.getElementById('foodCityTax').textContent = `$${foodCityTax.toFixed(2)}`;
        const alcoholRow = document.getElementById('alcoholTaxRow');
        if (alcoholRow) alcoholRow.style.display = alcoholStateTax > 0 ? 'flex' : 'none';
        document.getElementById('alcoholStateTax').textContent = `$${alcoholStateTax.toFixed(2)}`;
        document.getElementById('additionalCost').textContent = `$${additionalCost.toFixed(2)}`;

        const totalTaxes = foodStateReducedTax + foodCityTax + alcoholStateTax;
        document.getElementById('taxSubtotal').textContent = `$${totalTaxes.toFixed(2)}`;
        
        // Calculate subtotal (before taxes and tip)
        const subtotalBeforeTaxes = roomCost + foodCost + breakfastCost + drinkCost + entremesesCost + additionalCost;
        
        // Calculate tip (from subtotal before taxes)
        const tipPercentageEl = document.getElementById('tipPercentage');
        const tipPercentage = tipPercentageEl ? parseFloat(tipPercentageEl.value) || 0 : 0;
        const tipAmount = subtotalBeforeTaxes * (tipPercentage / 100);
        const tipAmountEl = document.getElementById('tipAmount');
        if (tipAmountEl) {
            tipAmountEl.textContent = tipPercentage > 0 
                ? `$${tipAmount.toFixed(2)} (${tipPercentage}%)` 
                : `$${tipAmount.toFixed(2)}`;
        }
        
        // Calculate final total (subtotal + taxes + tip)
        const totalCost = subtotalBeforeTaxes + totalTaxes + tipAmount;
        const totalCostEl = document.getElementById('totalCost');
        if (totalCostEl) {
            totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
        }
        
        // Calculate deposit (based on selected percentage of total cost)
        const depositPercentageEl = document.getElementById('depositPercentage');
        const depositPercentage = depositPercentageEl ? parseFloat(depositPercentageEl.value) || 0 : 20;
        const depositAmount = totalCost * (depositPercentage / 100);
        const depositAmountEl = document.getElementById('depositAmount');
        if (depositAmountEl) {
            depositAmountEl.textContent = depositPercentage > 0 
                ? `$${depositAmount.toFixed(2)} (${depositPercentage}%)` 
                : `$${depositAmount.toFixed(2)}`;
        }

        return {
            roomCost,
            foodCost,
            breakfastCost,
            drinkCost,
            entremesesCost,
            additionalCost,
            taxes: {
                foodStateReducedTax,
                foodCityTax,
                alcoholStateTax,
                totalTaxes
            },
            tip: {
                percentage: tipPercentage,
                amount: tipAmount
            },
            subtotalBeforeTaxes,
            totalCost,
            depositAmount,
            depositPercentage,
            guestCount,
            eventDuration
        };
    }

    // Save reservation
    async saveReservation() {
        const formEl = document.getElementById('reservationForm');
        const formData = new FormData(formEl);
        const pricing = this.calculatePrice();

        // Check required fields only
        const missingFields = [];
        
        // Get all visible form fields that are required
        const formFields = formEl.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), select, textarea');
        
        formFields.forEach(field => {
            // Skip hidden fields (checkboxes are already excluded)
            if (field.classList.contains('hidden') || field.closest('.hidden')) {
                return;
            }
            
            // Skip if field is inside a hidden parent
            const parent = field.closest('#otherEventTypeGroup');
            if (parent && parent.classList.contains('hidden') && field.id !== 'otherEventType') {
                return;
            }
            
            // Skip optional fields
            const optionalFields = [
                'clientEmail',
                'companyName',
                'breakfastType',
                'dessertType',
                'eventDuration',
                'eventType' // Event type is optional unless "other" is selected
            ];
            
            if (optionalFields.includes(field.id) || optionalFields.includes(field.name)) {
                return;
            }
            
            // Only check fields that have the required attribute OR are explicitly required
            const isRequired = field.hasAttribute('required');
            
            if (!isRequired) {
                return;
            }
            
            const value = field.value ? field.value.trim() : '';
            const fieldId = field.id || field.name;
            
            // Check if field is empty
            if (!value || value === '' || (field.tagName === 'SELECT' && value === '')) {
                missingFields.push(fieldId);
            }
        });

        // Extra validation when event type is "other"
        const eventType = formData.get('eventType');
        if (eventType === 'other') {
            const otherEventType = document.getElementById('otherEventType');
            if (!otherEventType || !otherEventType.value.trim()) {
                if (!missingFields.includes('otherEventType')) {
                    missingFields.push('otherEventType');
                }
            }
        }

        // Extra validation for guest count - make it more lenient
        const guestCountManual = document.getElementById('guestCountManual');
        const guestCount = parseInt(guestCountManual?.value) || parseInt(document.getElementById('guestCount')?.value) || 50;
        // Only validate if guest count is explicitly 0 or negative, otherwise use default
        if (guestCount < 1) {
            if (!missingFields.includes('guestCount')) {
                missingFields.push('guestCount');
            }
        }

        // Extra validation when buffet is chosen (modal fields are outside the form)
        // Make buffet validation optional in demo mode
        let buffetSelections = null;
        const foodTypeValue = formData.get('foodType');
        if (this.isBuffet(foodTypeValue) && !this.isDemoMode) {
            // Only validate buffet fields in non-demo mode
            const riceEl = document.getElementById('buffetRice');
            const rice2El = document.getElementById('buffetRice2');
            const p1El = document.getElementById('buffetProtein1');
            const p2El = document.getElementById('buffetProtein2');
            const sideEl = document.getElementById('buffetSide');
            const saladEl = document.getElementById('buffetSalad');
            const salad2El = document.getElementById('buffetSalad2');
            const panecillosEl = document.getElementById('buffetPanecillos');
            const aguaRefrescoEl = document.getElementById('buffetAguaRefresco');
            const pastelesEl = document.getElementById('buffetPasteles');

            buffetSelections = {
                rice: riceEl?.value || '',
                rice2: rice2El?.value || '',
                protein1: p1El?.value || '',
                protein2: p2El?.value || '',
                side: sideEl?.value || '',
                salad: saladEl?.value || '',
                salad2: salad2El?.value || '',
                panecillos: panecillosEl?.checked || false,
                aguaRefresco: aguaRefrescoEl?.checked || false,
                pasteles: pastelesEl?.checked || false
            };

            if (!buffetSelections.rice) {
                if (!missingFields.includes('buffetRice')) missingFields.push('buffetRice');
            }
            if (!buffetSelections.protein1) {
                if (!missingFields.includes('buffetProtein1')) missingFields.push('buffetProtein1');
            }
            // Protein 2 is optional, no validation needed
            if (!buffetSelections.side) {
                if (!missingFields.includes('buffetSide')) missingFields.push('buffetSide');
            }
            if (!buffetSelections.salad) {
                if (!missingFields.includes('buffetSalad')) missingFields.push('buffetSalad');
            }
            // Salad 2 is optional, no validation needed
        } else if (this.isBuffet(foodTypeValue)) {
            // In demo mode, just collect buffet selections without validation
            const riceEl = document.getElementById('buffetRice');
            const rice2El = document.getElementById('buffetRice2');
            const p1El = document.getElementById('buffetProtein1');
            const p2El = document.getElementById('buffetProtein2');
            const sideEl = document.getElementById('buffetSide');
            const saladEl = document.getElementById('buffetSalad');
            const salad2El = document.getElementById('buffetSalad2');
            const panecillosEl = document.getElementById('buffetPanecillos');
            const aguaRefrescoEl = document.getElementById('buffetAguaRefresco');
            const pastelesEl = document.getElementById('buffetPasteles');

            buffetSelections = {
                rice: riceEl?.value || '',
                rice2: rice2El?.value || '',
                protein1: p1El?.value || '',
                protein2: p2El?.value || '',
                side: sideEl?.value || '',
                salad: saladEl?.value || '',
                salad2: salad2El?.value || '',
                panecillos: panecillosEl?.checked || false,
                aguaRefresco: aguaRefrescoEl?.checked || false,
                pasteles: pastelesEl?.checked || false
            };
        }

        // Extra validation when breakfast is chosen (modal fields are outside the form)
        let breakfastSelections = null;
        const breakfastType = formData.get('breakfastType');
        if (this.isBreakfast(breakfastType)) {
            const cafeEl = document.getElementById('breakfastCafe');
            const jugoEl = document.getElementById('breakfastJugo');
            const avenaEl = document.getElementById('breakfastAvena');
            const wrapJamonQuesoEl = document.getElementById('breakfastWrapJamonQueso');
            const bocadilloJamonQuesoEl = document.getElementById('breakfastBocadilloJamonQueso');

            breakfastSelections = {
                cafe: cafeEl?.checked || false,
                jugo: jugoEl?.checked || false,
                avena: avenaEl?.checked || false,
                wrapJamonQueso: wrapJamonQuesoEl?.checked || false,
                bocadilloJamonQueso: bocadilloJamonQuesoEl?.checked || false
            };
        }

        // Extra validation when dessert is chosen (modal fields are outside the form)
        let dessertSelections = null;
        const dessertType = formData.get('dessertType');
        if (this.isDessert(dessertType)) {
            const flanQuesoEl = document.getElementById('dessertFlanQueso');
            const flanVainillaEl = document.getElementById('dessertFlanVainilla');
            const flanCocoEl = document.getElementById('dessertFlanCoco');
            const cheesecakeEl = document.getElementById('dessertCheesecake');
            const bizcochoChocolateEl = document.getElementById('dessertBizcochoChocolate');
            const bizcochoZanahoriaEl = document.getElementById('dessertBizcochoZanahoria');
            const tresLechesEl = document.getElementById('dessertTresLeches');
            const temblequeEl = document.getElementById('dessertTembleque');
            const postresSurtidosEl = document.getElementById('dessertPostresSurtidos');

            dessertSelections = {
                flanQueso: flanQuesoEl?.checked || false,
                flanVainilla: flanVainillaEl?.checked || false,
                flanCoco: flanCocoEl?.checked || false,
                cheesecake: cheesecakeEl?.checked || false,
                bizcochoChocolate: bizcochoChocolateEl?.checked || false,
                bizcochoZanahoria: bizcochoZanahoriaEl?.checked || false,
                tresLeches: tresLechesEl?.checked || false,
                tembleque: temblequeEl?.checked || false,
                postresSurtidos: postresSurtidosEl?.checked || false
            };
        }

        if (missingFields.length > 0) {
            console.log('Missing fields detected:', missingFields); // Debug log
            console.log('Form data:', {
                clientName: formData.get('clientName'),
                clientPhone: formData.get('clientPhone'),
                eventDate: formData.get('eventDate'),
                eventTime: formData.get('eventTime'),
                roomType: formData.get('roomType'),
                foodType: formData.get('foodType'),
                guestCount: guestCount
            });
            this.showValidationError(missingFields);
            return false;
        }
        
        console.log('✅ All validations passed, saving reservation...');

        // Create reservation object
        const reservation = {
            id: Date.now().toString(),
            clientName: formData.get('clientName'),
            clientEmail: formData.get('clientEmail'),
            clientPhone: formData.get('clientPhone'),
            eventDate: formData.get('eventDate'),
            eventTime: formData.get('eventTime'),
            eventType: eventType === 'other' ? formData.get('otherEventType') : (eventType || ''),
            eventDuration: formData.get('eventDuration') || '4', // Default to 4 hours if not specified
            companyName: formData.get('companyName') || '',
            roomType: formData.get('roomType'),
            foodType: formData.get('foodType'),
            breakfastType: breakfastType || null,
            dessertType: dessertType || null,
            buffet: this.isBuffet(formData.get('foodType')) ? {
                rice: buffetSelections?.rice || null,
                rice2: buffetSelections?.rice2 || null,
                protein1: buffetSelections?.protein1 || null,
                protein2: buffetSelections?.protein2 || null,
                side: buffetSelections?.side || null,
                salad: buffetSelections?.salad || null,
                salad2: buffetSelections?.salad2 || null,
                panecillos: buffetSelections?.panecillos || false,
                aguaRefresco: buffetSelections?.aguaRefresco || false,
                pasteles: buffetSelections?.pasteles || false
            } : null,
            breakfast: this.isBreakfast(breakfastType) ? {
                cafe: breakfastSelections?.cafe || false,
                jugo: breakfastSelections?.jugo || false,
                avena: breakfastSelections?.avena || false,
                wrapJamonQueso: breakfastSelections?.wrapJamonQueso || false,
                bocadilloJamonQueso: breakfastSelections?.bocadilloJamonQueso || false
            } : null,
            dessert: this.isDessert(dessertType) ? {
                flanQueso: dessertSelections?.flanQueso || false,
                flanVainilla: dessertSelections?.flanVainilla || false,
                flanCoco: dessertSelections?.flanCoco || false,
                cheesecake: dessertSelections?.cheesecake || false,
                bizcochoChocolate: dessertSelections?.bizcochoChocolate || false,
                bizcochoZanahoria: dessertSelections?.bizcochoZanahoria || false,
                tresLeches: dessertSelections?.tresLeches || false,
                tembleque: dessertSelections?.tembleque || false,
                postresSurtidos: dessertSelections?.postresSurtidos || false
            } : null,
            // drinkType removed; beverages are captured in the beverages map
            beverages: this.beverageSelections,
            entremeses: this.entremesesSelections,
            guestCount: pricing.guestCount || guestCount || 50, // Ensure guest count has a value
            tableConfiguration: null,
            additionalServices: {
                audioVisual: formData.get('audioVisual') === 'on',
                sillas: formData.get('sillas') === 'on',
                mesas: formData.get('mesas') === 'on',
                decorations: formData.get('decorations') === 'on',
                waitstaff: formData.get('waitstaff') === 'on',
                valet: formData.get('valet') === 'on'
            },
            tipPercentage: parseFloat(formData.get('tipPercentage') || 0),
            depositPercentage: parseFloat(formData.get('depositPercentage') || 20),
            depositPaid: false, // Default to unpaid, can be toggled later
            pricing: pricing,
            createdAt: new Date().toISOString(),
            isDemo: this.isDemoMode || false // Mark as demo if in demo mode
        };

        // Add to reservations
        this.reservations.push(reservation);
        console.log(`✅ Reservation added to array. Total reservations: ${this.reservations.length}`);
        console.log('Reservation data:', reservation);
        
        try {
            // Save to storage
            await this.saveReservations();
            console.log('✅ Reservation saved to storage');
            console.log(`Current reservations count: ${this.reservations.length}`);
            
            // Update UI - wrap each in try-catch to prevent one failure from breaking everything
            try {
                this.displayReservations();
            } catch (displayError) {
                console.error('Error displaying reservations:', displayError);
            }
            
            try {
                this.updateDashboard();
            } catch (dashboardError) {
                console.error('Error updating dashboard:', dashboardError);
            }
            
            try {
                this.clearForm();
            } catch (clearError) {
                console.error('Error clearing form:', clearError);
            }

            // Show success message
            this.showNotification('¡Reservación guardada exitosamente!', 'success');
        } catch (error) {
            console.error('Error saving reservation:', error);
            console.error('Error stack:', error.stack);
            // In demo mode, always try to save to localStorage as fallback
            if (this.isDemoMode) {
                try {
                    console.log('Attempting fallback save to localStorage...');
                    this.saveReservationsToLocalStorage();
                    console.log('✅ Fallback save successful');
                    
                    // Try to update UI even if there were errors
                    try {
                        this.displayReservations();
                    } catch (e) {
                        console.error('Error in displayReservations (fallback):', e);
                    }
                    
                    try {
                        this.updateDashboard();
                    } catch (e) {
                        console.error('Error in updateDashboard (fallback):', e);
                    }
                    
                    try {
                        this.clearForm();
                    } catch (e) {
                        console.error('Error in clearForm (fallback):', e);
                    }
                    
                    this.showNotification('¡Reservación guardada exitosamente!', 'success');
                } catch (localError) {
                    console.error('Error in fallback save:', localError);
                    console.error('Fallback error stack:', localError.stack);
                    this.showNotification('Error al guardar la reservación. Por favor, intente nuevamente.', 'error');
                }
            } else {
                this.showNotification('Error al guardar la reservación. Por favor, intente nuevamente.', 'error');
            }
        }
    }

    // Clear form
    clearForm() {
        document.getElementById('reservationForm').reset();
        this.updateGuestCountDisplay();
        this.syncGuestCountInputs();
        this.handleEventTypeChange();
        this.handleFoodTypeChange();
        this.handleBreakfastTypeChange();
        this.handleDessertTypeChange();
        
        // Reset all pricing displays to zero
        document.getElementById('roomCost').textContent = '$0.00';
        document.getElementById('foodCost').textContent = '$0.00';
        document.getElementById('drinkCost').textContent = '$0.00';
        document.getElementById('entremesesCost').textContent = '$0.00';
        document.getElementById('foodStateReducedTax').textContent = '$0.00';
        document.getElementById('foodCityTax').textContent = '$0.00';
        document.getElementById('alcoholStateTax').textContent = '$0.00';
        document.getElementById('additionalCost').textContent = '$0.00';
        document.getElementById('taxSubtotal').textContent = '$0.00';
        document.getElementById('tipAmount').textContent = '$0.00 (0%)';
        document.getElementById('totalCost').textContent = '$0.00';
        document.getElementById('depositAmount').textContent = '$0.00 (20%)';
        const depositPercentage = document.getElementById('depositPercentage');
        if (depositPercentage) depositPercentage.value = '20';
        
        // Hide alcohol tax row if visible
        const alcoholRow = document.getElementById('alcoholTaxRow');
        if (alcoholRow) alcoholRow.style.display = 'none';
        
        // Reset tip percentage dropdown
        const tipPercentage = document.getElementById('tipPercentage');
        if (tipPercentage) tipPercentage.value = '0';
        
        this.updateFoodServiceSummary();
        this.updateBreakfastServiceSummary();
        this.updateDessertServiceSummary();
        this.beverageSelections = {};
        this.updateBeverageSummary();
        this.entremesesSelections = {};
        this.updateEntremesesSummary();
    }

    // Update dashboard statistics
    updateDashboard() {
        const totalReservations = this.reservations.length;
        const totalRevenue = this.reservations.reduce((sum, res) => sum + res.pricing.totalCost, 0);
        const totalGuests = this.reservations.reduce((sum, res) => sum + res.guestCount, 0);
        
        // Today's reservations
        const today = new Date().toISOString().split('T')[0];
        const todayReservations = this.reservations.filter(res => res.eventDate === today).length;

        // Update stats
        document.getElementById('totalReservations').textContent = totalReservations;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('totalGuests').textContent = totalGuests;
        document.getElementById('todayReservations').textContent = todayReservations;

        // Update recent reservations
        this.updateRecentReservations();
        
        // Update upcoming events
        this.updateUpcomingEvents();
    }

    // Update recent reservations
    updateRecentReservations() {
        const container = document.getElementById('recentReservations');
        const recent = this.reservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">No reservations yet</p>';
            return;
        }

        container.innerHTML = recent.map(reservation => {
            const eventDate = new Date(reservation.eventDate + 'T00:00:00');
            const month = String(eventDate.getMonth() + 1).padStart(2, '0');
            const day = String(eventDate.getDate()).padStart(2, '0');
            const year = eventDate.getFullYear();
            const formattedDate = `${month}/${day}/${year}`;
            return `
            <div class="recent-item">
                <div class="recent-item-info">
                    <strong>${reservation.clientName}</strong>
                    <span>${formattedDate} at ${this.formatTime12Hour(reservation.eventTime)}</span>
                </div>
                <div class="recent-item-price">$${reservation.pricing.totalCost.toFixed(2)}</div>
            </div>
            `;
        }).join('');
    }

    // Update upcoming events
    updateUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const today = new Date();
        const upcoming = this.reservations
            .filter(res => new Date(res.eventDate) >= today)
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 5);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">No upcoming events</p>';
            return;
        }

        container.innerHTML = upcoming.map(reservation => {
            const eventDate = new Date(reservation.eventDate + 'T00:00:00');
            const month = String(eventDate.getMonth() + 1).padStart(2, '0');
            const day = String(eventDate.getDate()).padStart(2, '0');
            const year = eventDate.getFullYear();
            const formattedDate = `${month}/${day}/${year}`;
            return `
            <div class="upcoming-item">
                <div class="upcoming-item-info">
                    <strong>${reservation.clientName}</strong>
                    <span>${formattedDate} at ${this.formatTime12Hour(reservation.eventTime)}</span>
                </div>
                <div class="upcoming-item-room">${this.getRoomDisplayName(reservation.roomType)}</div>
            </div>
            `;
        }).join('');
    }

    // Display calendar view
    displayCalendar() {
        const container = document.getElementById('calendarView');
        const monthYearElement = document.getElementById('calendarMonthYear');
        const today = new Date();
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        // Create calendar header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Update month/year display
        monthYearElement.textContent = `${monthNames[this.currentCalendarMonth]} ${this.currentCalendarYear}`;

        let calendarHTML = `
            <div class="calendar-days-header">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
            </div>
        `;

        // Create calendar grid (42 cells = 6 weeks)
        for (let i = 0; i < 42; i++) {
            const dayNumber = i - startDay + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const isToday = isCurrentMonth && 
                           dayNumber === today.getDate() && 
                           this.currentCalendarMonth === today.getMonth() && 
                           this.currentCalendarYear === today.getFullYear();
            
            if (isCurrentMonth) {
                const dateStr = `${this.currentCalendarYear}-${String(this.currentCalendarMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const dayReservations = this.reservations.filter(res => res.eventDate === dateStr);
                
                calendarHTML += `
                    <div class="calendar-day ${isToday ? 'today' : ''}" onclick="reservationManager.selectDateFromCalendar('${dateStr}', event)">
                        <div class="calendar-day-number">${dayNumber}</div>
                        ${dayReservations.map(res => `
                            <div class="calendar-event" onclick="reservationManager.showReservationDetails('${res.id}', event)">
                                ${res.clientName} - ${this.formatTime12Hour(res.eventTime)}<br>
                                <small>${this.getRoomDisplayName(res.roomType)}</small>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }

        container.innerHTML = calendarHTML;
    }

    // Navigate to previous month
    previousMonth() {
        this.currentCalendarMonth--;
        if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        this.displayCalendar();
    }

    // Navigate to next month
    nextMonth() {
        this.currentCalendarMonth++;
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        }
        this.displayCalendar();
    }

    // Update analytics
    updateAnalytics() {
        this.updateRoomStats();
        this.updateGuestStats();
    }

    // Update room statistics
    updateRoomStats() {
        const container = document.getElementById('roomStats');
        const roomCounts = {};
        
        this.reservations.forEach(res => {
            roomCounts[res.roomType] = (roomCounts[res.roomType] || 0) + 1;
        });

        const roomNames = {
            'grand-hall': 'Salon 1',
            'intimate-room': 'Salon 2',
            'outdoor-terrace': 'Salon 3'
        };

        container.innerHTML = Object.entries(roomCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([room, count]) => `
                <div class="stat-item">
                    <span>${roomNames[room] || room}</span>
                    <strong>${count} events</strong>
                </div>
            `).join('');
    }

    // Update guest statistics
    updateGuestStats() {
        const container = document.getElementById('guestStats');
        const totalGuests = this.reservations.reduce((sum, res) => sum + res.guestCount, 0);
        const avgGuests = this.reservations.length > 0 ? totalGuests / this.reservations.length : 0;
        const maxGuests = Math.max(...this.reservations.map(res => res.guestCount), 0);
        const minGuests = Math.min(...this.reservations.map(res => res.guestCount), 0);

        container.innerHTML = `
            <h4>${avgGuests.toFixed(1)}</h4>
            <p>Average guests per event</p>
            <div class="stats-details">
                <div>Max: ${maxGuests} guests</div>
                <div>Min: ${minGuests} guests</div>
                <div>Total: ${totalGuests} guests</div>
            </div>
        `;
    }

    // Select date from calendar and navigate to reservation form
    selectDateFromCalendar(dateStr, clickEvent) {
        // If clicking on a reservation event, don't select the date
        if (clickEvent && clickEvent.target.closest('.calendar-event')) {
            return;
        }
        
        // Navigate to new reservation form
        this.showSection('new-reservation');
        
        // Pre-fill the date field
        const eventDateInput = document.getElementById('eventDate');
        if (eventDateInput) {
            eventDateInput.value = dateStr;
            // Trigger change event to update any dependent fields
            eventDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Scroll to form
        setTimeout(() => {
            const form = document.querySelector('.reservation-form');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    // Show reservation details
    showReservationDetails(id, clickEvent) {
        // Stop event propagation to prevent date selection
        if (clickEvent) {
            clickEvent.stopPropagation();
        }
        
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;
        
        const modal = document.getElementById('reservationDetailsModal');
        const body = document.getElementById('reservationDetailsBody');
        
        // Format date
        const eventDate = new Date(reservation.eventDate + 'T00:00:00');
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const year = eventDate.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        
        // Build reservation details HTML
        let detailsHTML = `
            <div class="reservation-details-content">
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Información del Cliente</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nombre:</span>
                            <span class="detail-value">${reservation.clientName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Correo Electrónico:</span>
                            <span class="detail-value">${reservation.clientEmail}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Teléfono:</span>
                            <span class="detail-value">${reservation.clientPhone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Detalles del Evento</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Tipo de Evento:</span>
                            <span class="detail-value">${reservation.eventType || 'N/A'}</span>
                        </div>
                        ${reservation.companyName ? `
                        <div class="detail-item">
                            <span class="detail-label">Nombre de Compania:</span>
                            <span class="detail-value">${reservation.companyName}</span>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${this.formatTime12Hour(reservation.eventTime)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duración:</span>
                            <span class="detail-value">${reservation.eventDuration ? reservation.eventDuration + ' horas' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-building"></i> Espacio e Invitados</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Espacio del Evento:</span>
                            <span class="detail-value">${this.getRoomDisplayName(reservation.roomType)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Número de Invitados:</span>
                            <span class="detail-value">${reservation.guestCount}</span>
                        </div>
                    </div>
                </div>
                
                ${(reservation.foodType && reservation.foodType !== 'no-food') || (reservation.beverages && Object.keys(reservation.beverages).length > 0 && Object.values(reservation.beverages).some(qty => (typeof qty === 'number' && qty > 0) || qty === true)) || (reservation.breakfastType && this.isBreakfast(reservation.breakfastType)) || (reservation.dessertType && this.isDessert(reservation.dessertType)) ? `
                <div class="detail-section">
                    <h4><i class="fas fa-utensils"></i> Comida y Bebidas</h4>
                    <div class="food-beverage-content">
                        ${reservation.foodType && reservation.foodType !== 'no-food' ? `
                        <div class="food-service-section">
                            <span class="detail-label">Servicio de Comida:</span>
                            <span class="detail-value">${this.getFoodDisplayName(reservation.foodType)}</span>
                            ${this.isBuffet(reservation.foodType) && reservation.buffet ? `
                            <ul class="detail-bullet-list">
                                ${reservation.buffet.rice ? `<li>${this.getBuffetItemName('rice', reservation.buffet.rice)}</li>` : ''}
                                ${reservation.buffet.rice2 ? `<li>${this.getBuffetItemName('rice', reservation.buffet.rice2)}</li>` : ''}
                                ${reservation.buffet.protein1 ? `<li>${this.getBuffetItemName('protein', reservation.buffet.protein1)}</li>` : ''}
                                ${reservation.buffet.protein2 ? `<li>${this.getBuffetItemName('protein', reservation.buffet.protein2)}</li>` : ''}
                                ${reservation.buffet.side ? `<li>${this.getBuffetItemName('side', reservation.buffet.side)}</li>` : ''}
                                ${reservation.buffet.salad ? `<li>${this.getBuffetItemName('salad', reservation.buffet.salad)}</li>` : ''}
                                ${reservation.buffet.salad2 ? `<li>${this.getBuffetItemName('salad', reservation.buffet.salad2)}</li>` : ''}
                                ${reservation.buffet.panecillos ? `<li>Panecillos</li>` : ''}
                                ${reservation.buffet.aguaRefresco ? `<li>Agua y Refresco</li>` : ''}
                                ${reservation.buffet.pasteles ? `<li>Pasteles</li>` : ''}
                            </ul>
                            ` : ''}
                        </div>
                        ` : ''}
                        ${reservation.breakfastType && this.isBreakfast(reservation.breakfastType) && reservation.breakfast ? `
                        <div class="food-service-section">
                            <span class="detail-label">Desayuno:</span>
                            <span class="detail-value">${this.getFoodDisplayName(reservation.breakfastType)}</span>
                            <ul class="detail-bullet-list">
                                ${reservation.breakfast.cafe ? `<li>Café</li>` : ''}
                                ${reservation.breakfast.jugo ? `<li>Jugo</li>` : ''}
                                ${reservation.breakfast.avena ? `<li>Avena</li>` : ''}
                                ${reservation.breakfast.wrapJamonQueso ? `<li>Wrap de Jamón y Queso</li>` : ''}
                                ${reservation.breakfast.bocadilloJamonQueso ? `<li>Bocadillo de Jamón y Queso</li>` : ''}
                            </ul>
                        </div>
                        ` : ''}
                        ${reservation.dessertType && this.isDessert(reservation.dessertType) && reservation.dessert ? `
                        <div class="food-service-section">
                            <span class="detail-label">Postres:</span>
                            <span class="detail-value">Postres</span>
                            <ul class="detail-bullet-list">
                                ${reservation.dessert.flanQueso ? `<li>Flan de Queso</li>` : ''}
                                ${reservation.dessert.flanVainilla ? `<li>Flan de Vainilla</li>` : ''}
                                ${reservation.dessert.flanCoco ? `<li>Flan de Coco</li>` : ''}
                                ${reservation.dessert.cheesecake ? `<li>Cheesecake</li>` : ''}
                                ${reservation.dessert.bizcochoChocolate ? `<li>Bizcocho de Chocolate</li>` : ''}
                                ${reservation.dessert.bizcochoZanahoria ? `<li>Bizcocho de Zanahoria</li>` : ''}
                                ${reservation.dessert.tresLeches ? `<li>Tres Leches</li>` : ''}
                                ${reservation.dessert.tembleque ? `<li>Tembleque</li>` : ''}
                                ${reservation.dessert.postresSurtidos ? `<li>Postres Surtidos</li>` : ''}
                            </ul>
                        </div>
                        ` : ''}
                        ${reservation.beverages && Object.keys(reservation.beverages).length > 0 && Object.values(reservation.beverages).some(qty => (typeof qty === 'number' && qty > 0) || qty === true) ? `
                        <div class="beverage-section">
                            <span class="detail-label">Bebidas:</span>
                            ${this.getBeverageBulletList(reservation.beverages)}
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${Object.values(reservation.additionalServices).some(v => v) ? `
                <div class="detail-section">
                    <h4><i class="fas fa-plus-circle"></i> Servicios Adicionales</h4>
                    <div class="detail-grid">
                        ${Object.entries(reservation.additionalServices)
                            .filter(([key, value]) => value)
                            .map(([key, value]) => `
                                <div class="detail-item">
                                    <span class="detail-label">Servicio:</span>
                                    <span class="detail-value">${this.getServiceName(key)}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-section pricing-section">
                    <h4><i class="fas fa-calculator"></i> Resumen de Precios</h4>
                    <div class="pricing-breakdown-modal">
                        <div class="pricing-row">
                            <span>Espacio del Evento:</span>
                            <span>$${reservation.pricing.roomCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicio de Comida:</span>
                            <span>$${reservation.pricing.foodCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicio de Bebidas:</span>
                            <span>$${reservation.pricing.drinkCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicios Adicionales:</span>
                            <span>$${reservation.pricing.additionalCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Impuestos:</span>
                            <span>$${reservation.pricing.taxes.totalTaxes.toFixed(2)}</span>
                        </div>
                        ${reservation.pricing.tip && reservation.pricing.tip.amount > 0 ? `
                        <div class="pricing-row">
                            <span>Propina (${reservation.pricing.tip.percentage}%):</span>
                            <span>$${reservation.pricing.tip.amount.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="pricing-row total-row">
                            <span>Costo Total:</span>
                            <span>$${reservation.pricing.totalCost.toFixed(2)}</span>
                        </div>
                        ${reservation.pricing.depositAmount > 0 ? `
                        <div class="pricing-row deposit-row">
                            <span>Depósito (${reservation.depositPercentage || reservation.pricing.depositPercentage || 20}%):</span>
                            <span>
                                $${reservation.pricing.depositAmount.toFixed(2)}
                                <span class="deposit-status-toggle ${reservation.depositPaid ? 'paid' : 'unpaid'}" onclick="reservationManager.toggleDepositStatus('${reservation.id}')" data-reservation-id="${reservation.id}">
                                    ${reservation.depositPaid ? '✓ Pagado' : 'No Pagado'}
                                </span>
                            </span>
                        </div>
                        ` : ''}
                        <div class="pricing-row balance-row">
                            <span>Balance:</span>
                            <span>$${((reservation.depositPaid ? reservation.pricing.totalCost - reservation.pricing.depositAmount : reservation.pricing.totalCost)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        body.innerHTML = detailsHTML;
        this.openReservationDetailsModal();
    }

    getServiceName(key) {
        const serviceNames = {
            'audioVisual': 'Manteles',
            'sillas': 'Sillas',
            'mesas': 'Mesas',
            'decorations': 'Basic Decorations',
            'waitstaff': 'Additional Waitstaff',
            'valet': 'Valet Parking'
        };
        return serviceNames[key] || key;
    }

    getBuffetItemName(type, value) {
        const names = {
            rice: {
                'cebolla': 'Arroz Cebolla',
                'cilantro': 'Arroz Cilantro',
                'mamposteado': 'Arroz Mamposteado',
                'consomme': 'Arroz Consommé',
                'griego': 'Arroz Griego',
                'gandules': 'Arroz con Gandules'
            },
            protein: {
                'pechuga-cilantro': 'Pechuga salsa Cilantro',
                'pechuga-tres-quesos': 'Pechuga tres quesos',
                'pechuga-ajillo': 'Pechuga Ajillo',
                'pavo-cranberry': 'Filete Pavo Frito salsa cranberry',
                'medallones-guayaba': 'Medallones salsa Guayaba',
                'pernil-asado': 'Pernil Asado',
                'pescado-ajillo': 'Filete de Pescado Ajillo',
                'churrasco-setas': 'Churrasco salsa setas'
            },
            side: {
                'papas-leonesa': 'Papas Leonesa',
                'papas-salteadas': 'Papas salteadas',
                'ensalada-papa': 'Ensalada Papa',
                'ensalada-coditos': 'Ensalada de coditos'
            },
            salad: {
                'caesar': 'Ensalada César',
                'verde': 'Ensalada Verde',
                'papa': 'Ensalada de Papa',
                'coditos': 'Ensalada de Coditos'
            }
        };
        return names[type]?.[value] || value;
    }

    getBeverageBulletList(beveragesMap) {
        if (!beveragesMap || Object.keys(beveragesMap).length === 0) {
            return '<span class="detail-value">None</span>';
        }
        const items = this.getBeverageItems();
        const beverageList = Object.entries(beveragesMap)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return `<li>${qty} x ${item ? item.name : id}</li>`;
            });
        return beverageList.length > 0 
            ? `<ul class="detail-bullet-list">${beverageList.join('')}</ul>`
            : '<span class="detail-value">None</span>';
    }

    openReservationDetailsModal() {
        const modal = document.getElementById('reservationDetailsModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeReservationDetailsModal() {
        const modal = document.getElementById('reservationDetailsModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    toggleDepositStatus(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;
        
        // Toggle the status
        reservation.depositPaid = !reservation.depositPaid;
        
        // Save to localStorage
        this.saveReservations();
        
        // Update only the specific card elements without re-rendering all cards
        const depositToggle = document.querySelector(`[data-reservation-id="${id}"].deposit-status-toggle`);
        if (depositToggle) {
            // Update the toggle button
            depositToggle.className = `deposit-status-toggle ${reservation.depositPaid ? 'paid' : 'unpaid'}`;
            depositToggle.textContent = reservation.depositPaid ? '✓ Pagado' : 'No Pagado';
            
            // Update the balance text in the same card
            const card = depositToggle.closest('.reservation-card');
            if (card) {
                // Find the balance element by looking for the strong tag with "Balance:" text
                const balanceSpans = card.querySelectorAll('.reservation-detail strong');
                balanceSpans.forEach(strong => {
                    if (strong.textContent.trim() === 'Balance:') {
                        const balanceSpan = strong.nextElementSibling;
                        if (balanceSpan && balanceSpan.tagName === 'SPAN') {
                            const newBalance = reservation.depositPaid 
                                ? reservation.pricing.totalCost - reservation.pricing.depositAmount 
                                : reservation.pricing.totalCost;
                            balanceSpan.textContent = `$${newBalance.toFixed(2)}`;
                        }
                    }
                });
            }
        }
        
        // If modal is open, refresh it
        const modal = document.getElementById('reservationDetailsModal');
        if (modal && !modal.classList.contains('hidden')) {
            this.showReservationDetails(id);
        }
        
        // Show notification
        const notificationType = reservation.depositPaid ? 'success' : 'error';
        this.showNotification(
            `Depósito marcado como ${reservation.depositPaid ? 'Pagado' : 'No Pagado'}`,
            notificationType
        );
    }

    // Display reservations
    displayReservations() {
        const container = document.getElementById('reservationsContainer');
        
        if (!container) {
            console.error('reservationsContainer not found!');
            return;
        }
        
        console.log(`Displaying ${this.reservations.length} reservations`);
        
        if (this.reservations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Aún no hay reservaciones</h3>
                    <p>Cree su primera reservación usando el formulario.</p>
                </div>
            `;
            return;
        }

        try {
            // Sort reservations by date (newest first)
            const sortedReservations = [...this.reservations].sort((a, b) => {
                const dateA = new Date(a.eventDate + 'T' + (a.eventTime || '00:00'));
                const dateB = new Date(b.eventDate + 'T' + (b.eventTime || '00:00'));
                return dateB - dateA; // Newest first
            });
            
            container.innerHTML = sortedReservations.map(reservation => {
                try {
                    return `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-client">${reservation.clientName}</div>
                    <div class="reservation-total">$${reservation.pricing.totalCost.toFixed(2)}</div>
                </div>
                <div class="reservation-details">
                    <div class="reservation-detail">
                        <strong>Fecha:</strong>
                        <span>${(() => {
                            const eventDate = new Date(reservation.eventDate + 'T00:00:00');
                            const month = String(eventDate.getMonth() + 1).padStart(2, '0');
                            const day = String(eventDate.getDate()).padStart(2, '0');
                            const year = eventDate.getFullYear();
                            return `${month}/${day}/${year}`;
                        })()}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Hora:</strong>
                        <span>${this.formatTime12Hour(reservation.eventTime)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Duración:</strong>
                        <span>${reservation.eventDuration ? reservation.eventDuration + ' horas' : 'N/A'}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Salón:</strong>
                        <span>${this.getRoomDisplayName(reservation.roomType)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Invitados:</strong>
                        <span>${reservation.guestCount}</span>
                    </div>
                    ${reservation.foodType && reservation.foodType !== 'no-food' ? `
                    <div class="reservation-detail">
                        <strong>Comida:</strong>
                        <span>${this.getFoodDisplayName(reservation.foodType)}</span>
                    </div>
                    ` : ''}
                    ${reservation.beverages && Object.keys(reservation.beverages).length > 0 && Object.values(reservation.beverages).some(qty => (typeof qty === 'number' && qty > 0) || qty === true) ? `
                    <div class="reservation-detail">
                        <strong>Bebidas:</strong>
                        <span>${this.getBeverageSummaryString(reservation.beverages)}</span>
                    </div>
                    ` : ''}
                    ${reservation.breakfastType && this.isBreakfast(reservation.breakfastType) ? `
                    <div class="reservation-detail">
                        <strong>Desayuno:</strong>
                        <span>${this.getFoodDisplayName(reservation.breakfastType)}</span>
                    </div>
                    ` : ''}
                    ${reservation.dessertType && this.isDessert(reservation.dessertType) && reservation.dessert ? `
                    <div class="reservation-detail">
                        <strong>Postres:</strong>
                        <span>${[
                            reservation.dessert.flanQueso ? 'Flan de Queso' : '',
                            reservation.dessert.flanVainilla ? 'Flan de Vainilla' : '',
                            reservation.dessert.flanCoco ? 'Flan de Coco' : '',
                            reservation.dessert.cheesecake ? 'Cheesecake' : '',
                            reservation.dessert.bizcochoChocolate ? 'Bizcocho de Chocolate' : '',
                            reservation.dessert.bizcochoZanahoria ? 'Bizcocho de Zanahoria' : '',
                            reservation.dessert.tresLeches ? 'Tres Leches' : '',
                            reservation.dessert.tembleque ? 'Tembleque' : '',
                            reservation.dessert.postresSurtidos ? 'Postres Surtidos' : ''
                        ].filter(Boolean).join(', ')}</span>
                    </div>
                    ` : ''}
                    <div class="reservation-detail">
                        <strong>Contacto:</strong>
                        <span>${reservation.clientPhone}</span>
                    </div>
                    ${reservation.pricing.depositAmount > 0 && (reservation.depositPercentage || reservation.pricing.depositPercentage || 0) > 0 ? `
                    <div class="reservation-detail">
                        <strong>Depósito:</strong>
                        <span>
                            $${reservation.pricing.depositAmount.toFixed(2)}
                            <span class="deposit-status-toggle ${reservation.depositPaid ? 'paid' : 'unpaid'}" onclick="reservationManager.toggleDepositStatus('${reservation.id}')" data-reservation-id="${reservation.id}">
                                ${reservation.depositPaid ? '✓ Pagado' : 'No Pagado'}
                            </span>
                        </span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Balance:</strong>
                        <span>$${((reservation.depositPaid ? reservation.pricing.totalCost - reservation.pricing.depositAmount : reservation.pricing.totalCost)).toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
                ${this.getAdditionalServicesDisplay(reservation.additionalServices)}
                <div class="reservation-actions">
                    <button class="btn btn-small btn-primary" onclick="exportReservationInvoice('${reservation.id}')">
                        <i class="fas fa-file-invoice"></i> Exportar Factura
                    </button>
                    <button class="btn btn-small btn-outline" onclick="reservationManager.editReservation('${reservation.id}')">
                        Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="reservationManager.deleteReservation('${reservation.id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
                } catch (reservationError) {
                    console.error('Error rendering reservation:', reservationError, reservation);
                    return `<div class="reservation-card error">Error displaying reservation: ${reservation.id}</div>`;
                }
            }).join('');
        } catch (error) {
            console.error('Error in displayReservations:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Error al cargar reservaciones</h3>
                    <p>Por favor, recargue la página.</p>
                </div>
            `;
        }
    }

    // Get display names for dropdown values
    getRoomDisplayName(roomType) {
        const roomNames = {
            'grand-hall': 'Salon 1',
            'intimate-room': 'Salon 2',
            'outdoor-terrace': 'Salon 3'
        };
        return roomNames[roomType] || roomType;
    }

    getFoodDisplayName(foodType) {
        if (this.isBuffet(foodType)) return 'Buffet';
        const foodNames = {
            'individual-plates': 'Platos Individuales',
            'cocktail-reception': 'Recepción de Cóctel',
            'desayuno-9.95': 'Desayuno $9.95',
            'desayuno-10.95': 'Desayuno $10.95',
            'no-food': 'Sin Servicio de Comida'
        };
        return foodNames[foodType] || foodType;
    }

    getDrinkDisplayName(drinkType) {
        // Deprecated with modal multi-select
        return '—';
    }

    getBeverageSummaryString(beveragesMap) {
        if (!beveragesMap || Object.keys(beveragesMap).length === 0) return 'Sin Servicio de Bebidas';
        const items = this.getBeverageItems();
        const parts = Object.entries(beveragesMap)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return `${qty} x ${item ? item.name : id}`;
            });
        return parts.length ? parts.join(', ') : 'Sin Servicio de Bebidas';
    }

    // Get table configuration display
    getTableConfigurationDisplay(tableConfig) {
        if (!tableConfig || !tableConfig.tableType || tableConfig.tableCount === 0) {
            return '';
        }
        const tableTypeNames = {
            'round': 'Mesa Redonda',
            'rectangular': 'Mesa Rectangular'
        };
        const tableTypeName = tableTypeNames[tableConfig.tableType] || tableConfig.tableType;
        return `
            <div class="reservation-detail">
                <strong>Configuración de Mesas:</strong>
                <span>${tableConfig.tableCount} ${tableConfig.tableCount === 1 ? 'Mesa' : 'Mesas'} ${tableTypeName}${tableConfig.seatsPerTable ? ` (${tableConfig.seatsPerTable} asientos c/u)` : ''}</span>
            </div>
        `;
    }

    // Get additional services display
    getAdditionalServicesDisplay(services) {
        const activeServices = Object.entries(services)
            .filter(([key, value]) => value)
            .map(([key, value]) => {
                const serviceNames = {
                    'audioVisual': 'Manteles',
                    'sillas': 'Sillas',
                    'mesas': 'Mesas',
                    'decorations': 'Basic Decorations',
                    'waitstaff': 'Additional Waitstaff',
                    'valet': 'Valet Parking'
                };
                return serviceNames[key] || key;
            });

        if (activeServices.length === 0) return '';

        return `
            <div class="reservation-detail">
                <strong>Servicios Adicionales:</strong>
                <span>${activeServices.join(', ')}</span>
            </div>
        `;
    }

    // Edit reservation
    editReservation(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;

        // Navigate to the reservation form section for editing
        this.showSection('new-reservation');

        // Populate form with reservation data
        document.getElementById('clientName').value = reservation.clientName;
        document.getElementById('clientEmail').value = reservation.clientEmail;
        // Format phone number when loading into edit form
        const clientPhoneInput = document.getElementById('clientPhone');
        if (clientPhoneInput) {
            const phoneNumbers = reservation.clientPhone.replace(/\D/g, '');
            clientPhoneInput.value = this.formatPhoneNumberString(phoneNumbers);
        }
        document.getElementById('eventDate').value = reservation.eventDate;
        document.getElementById('eventTime').value = reservation.eventTime;
        document.getElementById('companyName').value = reservation.companyName || '';
        
        // Handle event type - check if it's a standard option or "other"
        const standardEventTypes = ['wedding', 'birthdays', 'pharmaceutical', 'baptism', 'graduation', 'fiesta-navidad'];
        const eventTypeValue = reservation.eventType || '';
        if (standardEventTypes.includes(eventTypeValue)) {
            document.getElementById('eventType').value = eventTypeValue;
        } else {
            // It's a custom event type, set to "other" and populate the other field
            document.getElementById('eventType').value = 'other';
            document.getElementById('otherEventType').value = eventTypeValue;
            this.handleEventTypeChange(); // This will show the otherEventType field
        }
        
        document.getElementById('eventDuration').value = reservation.eventDuration;
        document.getElementById('companyName').value = reservation.companyName || '';
        document.getElementById('roomType').value = reservation.roomType;
        document.getElementById('foodType').value = reservation.foodType;
        const breakfastTypeEl = document.getElementById('breakfastType');
        if (breakfastTypeEl) breakfastTypeEl.value = reservation.breakfastType || '';
        const dessertTypeEl = document.getElementById('dessertType');
        if (dessertTypeEl) dessertTypeEl.value = reservation.dessertType || '';
        // no drinkType select anymore
        this.beverageSelections = reservation.beverages || {};
        this.updateBeverageSummary();
        this.entremesesSelections = reservation.entremeses || {};
        this.updateEntremesesSummary();
        
        // Sync guest count across all inputs (slider, manual input, and display)
        const guestCount = reservation.guestCount;
        const guestCountSlider = document.getElementById('guestCount');
        const guestCountManual = document.getElementById('guestCountManual');
        const guestCountDisplay = document.getElementById('guestCountValue');
        
        // Round to nearest 10 for slider (since it's step-10)
        const sliderValue = Math.max(10, Math.min(200, Math.round(guestCount / 10) * 10));
        guestCountSlider.value = sliderValue;
        
        // Set manual input to exact value
        guestCountManual.value = guestCount;
        
        // Update display
        guestCountDisplay.textContent = guestCount;

        // Populate buffet modal fields (do not open the modal)
        if (this.isBuffet(reservation.foodType)) {
            const buffet = reservation.buffet || {};
            const riceEl = document.getElementById('buffetRice');
            const rice2El = document.getElementById('buffetRice2');
            const p1El = document.getElementById('buffetProtein1');
            const p2El = document.getElementById('buffetProtein2');
            const sideEl = document.getElementById('buffetSide');
            const saladEl = document.getElementById('buffetSalad');
            const salad2El = document.getElementById('buffetSalad2');
            if (riceEl) riceEl.value = buffet.rice || '';
            if (rice2El) rice2El.value = buffet.rice2 || '';
            if (p1El) p1El.value = buffet.protein1 || '';
            if (p2El) p2El.value = buffet.protein2 || '';
            if (sideEl) sideEl.value = buffet.side || '';
            if (saladEl) saladEl.value = buffet.salad || '';
            if (salad2El) salad2El.value = buffet.salad2 || '';
            const panecillosEl = document.getElementById('buffetPanecillos');
            if (panecillosEl) panecillosEl.checked = buffet.panecillos || false;
            const aguaRefrescoEl = document.getElementById('buffetAguaRefresco');
            if (aguaRefrescoEl) aguaRefrescoEl.checked = buffet.aguaRefresco || false;
            const pastelesEl = document.getElementById('buffetPasteles');
            if (pastelesEl) pastelesEl.checked = buffet.pasteles || false;
            this.clearBreakfastSelections();
        } else {
            this.clearBuffetSelections();
        }

        // Populate breakfast modal fields (do not open the modal)
        if (reservation.breakfastType && this.isBreakfast(reservation.breakfastType)) {
            const breakfast = reservation.breakfast || {};
            const cafeEl = document.getElementById('breakfastCafe');
            if (cafeEl) cafeEl.checked = breakfast.cafe || false;
            const jugoEl = document.getElementById('breakfastJugo');
            if (jugoEl) jugoEl.checked = breakfast.jugo || false;
            const avenaEl = document.getElementById('breakfastAvena');
            if (avenaEl) avenaEl.checked = breakfast.avena || false;
            const wrapJamonQuesoEl = document.getElementById('breakfastWrapJamonQueso');
            if (wrapJamonQuesoEl) wrapJamonQuesoEl.checked = breakfast.wrapJamonQueso || false;
            const bocadilloJamonQuesoEl = document.getElementById('breakfastBocadilloJamonQueso');
            if (bocadilloJamonQuesoEl) bocadilloJamonQuesoEl.checked = breakfast.bocadilloJamonQueso || false;
        } else {
            this.clearBreakfastSelections();
        }

        // Populate dessert modal fields (do not open the modal)
        if (reservation.dessertType && this.isDessert(reservation.dessertType)) {
            const dessert = reservation.dessert || {};
            const flanQuesoEl = document.getElementById('dessertFlanQueso');
            if (flanQuesoEl) flanQuesoEl.checked = dessert.flanQueso || false;
            const flanVainillaEl = document.getElementById('dessertFlanVainilla');
            if (flanVainillaEl) flanVainillaEl.checked = dessert.flanVainilla || false;
            const flanCocoEl = document.getElementById('dessertFlanCoco');
            if (flanCocoEl) flanCocoEl.checked = dessert.flanCoco || false;
            const cheesecakeEl = document.getElementById('dessertCheesecake');
            if (cheesecakeEl) cheesecakeEl.checked = dessert.cheesecake || false;
            const bizcochoChocolateEl = document.getElementById('dessertBizcochoChocolate');
            if (bizcochoChocolateEl) bizcochoChocolateEl.checked = dessert.bizcochoChocolate || false;
            const bizcochoZanahoriaEl = document.getElementById('dessertBizcochoZanahoria');
            if (bizcochoZanahoriaEl) bizcochoZanahoriaEl.checked = dessert.bizcochoZanahoria || false;
            const tresLechesEl = document.getElementById('dessertTresLeches');
            if (tresLechesEl) tresLechesEl.checked = dessert.tresLeches || false;
            const temblequeEl = document.getElementById('dessertTembleque');
            if (temblequeEl) temblequeEl.checked = dessert.tembleque || false;
            const postresSurtidosEl = document.getElementById('dessertPostresSurtidos');
            if (postresSurtidosEl) postresSurtidosEl.checked = dessert.postresSurtidos || false;
        } else {
            this.clearDessertSelections();
        }

        // Set additional services checkboxes
        Object.entries(reservation.additionalServices).forEach(([service, checked]) => {
            const checkbox = document.getElementById(service);
            if (checkbox) {
                checkbox.checked = checked;
            }
        });

        // Restore tip percentage
        const tipPercentage = reservation.tipPercentage || 0;
        const tipPercentageEl = document.getElementById('tipPercentage');
        if (tipPercentageEl) {
            tipPercentageEl.value = tipPercentage.toString();
        }

        // Get deposit percentage - allow 0 as a valid value (Sin Depósito)
        // Use nullish coalescing (??) to only default when value is null/undefined, not when it's 0
        const depositPercentage = reservation.depositPercentage ?? reservation.pricing?.depositPercentage ?? 20;
        const depositPercentageEl = document.getElementById('depositPercentage');
        if (depositPercentageEl) {
            depositPercentageEl.value = depositPercentage.toString();
        }

        // Update displays
        this.updateGuestCountDisplay();
        this.calculatePrice();
        this.updateFoodServiceSummary();
        this.updateBreakfastServiceSummary();
        this.updateDessertServiceSummary();

        // Remove the reservation from the list (will be re-added when saved)
        this.reservations = this.reservations.filter(r => r.id !== id);
        this.saveReservations();
        this.displayReservations();

        // Scroll to form
        document.querySelector('.reservation-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete reservation
    deleteReservation(id) {
        if (confirm('¿Está seguro de que desea eliminar esta reservación?')) {
            this.reservations = this.reservations.filter(r => r.id !== id);
            this.saveReservations();
            this.displayReservations();
            this.showNotification('¡Reservación eliminada exitosamente!', 'success');
        }
    }

    // Show validation error modal
    showValidationError(missingFields) {
        console.log('showValidationError called with:', missingFields); // Debug log
        const modal = document.getElementById('validationErrorModal');
        const listContainer = document.getElementById('missingFieldsList');
        if (!modal) {
            console.error('Validation modal not found!');
            return;
        }
        if (!listContainer) {
            console.error('Missing fields list container not found!');
            return;
        }

        // Map field IDs to user-friendly Spanish names
        const fieldNames = {
            'clientName': 'Nombre del Cliente',
            'clientEmail': 'Correo Electrónico',
            'clientPhone': 'Teléfono',
            'eventDate': 'Fecha del Evento',
            'eventTime': 'Hora del Evento',
            'eventType': 'Tipo de Evento',
            'otherEventType': 'Especificar Tipo de Evento',
            'roomType': 'Espacio del Evento',
            'foodType': 'Servicio de Comida',
            'dessertType': 'Postres',
            'eventDuration': 'Duración del Evento',
            'guestCount': 'Número de Invitados',
            'guestCountManual': 'Número de Invitados',
            'buffetRice': 'Arroz (Buffet)',
            'buffetProtein1': 'Proteína 1 (Buffet)',
            'buffetProtein2': 'Proteína 2 (Buffet)',
            'buffetSide': 'Acompañamiento (Buffet)',
            'buffetSalad': 'Ensalada 1 (Buffet)',
            'buffetSalad2': 'Ensalada 2 (Buffet)'
        };

        // If field name not in map, try to get it from the label
        const getFieldName = (fieldId) => {
            if (fieldNames[fieldId]) {
                return fieldNames[fieldId];
            }
            // Try to find the label for this field
            const field = document.getElementById(fieldId);
            if (field) {
                const label = document.querySelector(`label[for="${fieldId}"]`);
                if (label) {
                    return label.textContent.trim();
                }
            }
            return fieldId;
        };

        // Create list items for missing fields
        const listItems = missingFields.map(field => {
            const fieldName = getFieldName(field);
            return `<li><i class="fas fa-times-circle"></i> ${fieldName}</li>`;
        });

        listContainer.innerHTML = listItems.join('');

        // Show modal with animation
        modal.classList.remove('hidden');
        void modal.offsetWidth; // Force reflow
        modal.classList.add('visible');
    }

    // Close validation error modal
    closeValidationErrorModal() {
        const modal = document.getElementById('validationErrorModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        // Determine background color based on type
        let backgroundColor = '#F27B21'; // default orange
        if (type === 'success') {
            backgroundColor = '#48bb78'; // green
        } else if (type === 'error') {
            backgroundColor = '#e53e3e'; // red
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Local storage methods
    // Save reservations to storage (Firestore or localStorage)
    async saveReservations() {
        // Always use localStorage in demo mode (never touch Firebase)
        if (this.isDemoMode) {
            try {
                this.saveReservationsToLocalStorage();
                console.log('✅ Demo reservation saved to localStorage');
            } catch (error) {
                console.error('Error saving to localStorage in demo mode:', error);
                // Try to save anyway - don't throw error in demo mode
                try {
                    const storageKey = 'antesalaReservations_demo';
                    localStorage.setItem(storageKey, JSON.stringify(this.reservations));
                } catch (fallbackError) {
                    console.error('Critical error: Could not save to localStorage:', fallbackError);
                }
            }
        } else if (window.FIREBASE_LOADED && window.firestore) {
            try {
                await this.saveReservationsToFirestore();
            } catch (error) {
                console.error('Error saving to Firestore, falling back to localStorage:', error);
                this.saveReservationsToLocalStorage();
            }
        } else {
            this.saveReservationsToLocalStorage();
        }
    }

    // Save to Firestore
    async saveReservationsToFirestore() {
        if (!window.FIREBASE_LOADED || !window.firestore) return;

        try {
            const batch = window.firestore.batch();
            const reservationsRef = window.firestore.collection('reservations');

            // Delete all existing documents first
            const snapshot = await reservationsRef.get();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Add all current reservations
            this.reservations.forEach((reservation) => {
                const docRef = reservationsRef.doc(reservation.id);
                batch.set(docRef, reservation);
            });

            await batch.commit();
            console.log('Reservations saved to Firestore:', this.reservations.length);
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            // Fallback to localStorage on error
            this.saveReservationsToLocalStorage();
        }
    }

    // Load from Firestore
    async loadReservationsFromFirestore() {
        if (!window.FIREBASE_LOADED || !window.firestore) return [];

        try {
            const snapshot = await window.firestore.collection('reservations').get();
            const reservations = [];
            snapshot.forEach((doc) => {
                reservations.push(doc.data());
            });
            // Sort by date
            reservations.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
            this.reservations = reservations;
            console.log('Reservations loaded from Firestore:', reservations.length);
            return reservations;
        } catch (error) {
            console.error('Error loading from Firestore:', error);
            // Fallback to localStorage on error
            return this.loadReservationsFromLocalStorage();
        }
    }

    // Save to localStorage
    saveReservationsToLocalStorage() {
        try {
            // Use separate key for demo mode to avoid conflicts
            const storageKey = this.isDemoMode ? 'antesalaReservations_demo' : 'antesalaReservations';
            const dataToSave = JSON.stringify(this.reservations);
            localStorage.setItem(storageKey, dataToSave);
            console.log(`✅ Saved ${this.reservations.length} reservations to localStorage (key: ${storageKey})`);
        } catch (error) {
            console.error('Error in saveReservationsToLocalStorage:', error);
            // If storage is full or there's an error, try to clear old data and retry
            try {
                console.log('Attempting to clear old data and retry...');
                const storageKey = this.isDemoMode ? 'antesalaReservations_demo' : 'antesalaReservations';
                // Keep only the last 50 reservations if storage is full
                if (this.reservations.length > 50) {
                    this.reservations = this.reservations.slice(-50);
                }
                localStorage.setItem(storageKey, JSON.stringify(this.reservations));
                console.log('✅ Retry save successful after clearing old data');
            } catch (retryError) {
                console.error('Critical: Could not save to localStorage even after retry:', retryError);
                throw retryError; // Re-throw if even retry fails
            }
        }
    }

    // Load from localStorage
    loadReservationsFromLocalStorage() {
        // Use separate key for demo mode to avoid conflicts
        const storageKey = this.isDemoMode ? 'antesalaReservations_demo' : 'antesalaReservations';
        const saved = localStorage.getItem(storageKey);
        const reservations = saved ? JSON.parse(saved) : [];
        
        // In demo mode, ONLY return reservations marked as demo
        // This ensures no real/sensitive data can be displayed
        if (this.isDemoMode) {
            return reservations.filter(reservation => reservation.isDemo === true);
        }
        
        return reservations;
    }

    // Legacy method for backward compatibility
    loadReservations() {
        if (window.FIREBASE_LOADED && window.firestore) {
            return this.reservations; // Already loaded via listener
        } else {
            return this.loadReservationsFromLocalStorage();
        }
    }

    // Export reservation as invoice
    async exportReservationInvoice(id) {
        console.log('Export invoice called with ID:', id);
        try {
            // Check if jsPDF is loaded
            if (!window.jspdf || !window.jspdf.jsPDF) {
                this.showNotification('Error: Las librerías de PDF no se cargaron correctamente. Por favor, recarga la página.', 'error');
                console.error('jsPDF library not loaded. Please check if CDN scripts are accessible.');
                console.log('window.jspdf:', window.jspdf);
                return;
            }
            console.log('jsPDF library loaded successfully');

            // Reload reservations to ensure we have the latest data
            if (window.FIREBASE_LOADED && window.firestore) {
                await this.loadReservationsFromFirestore();
            } else {
                this.reservations = this.loadReservations();
            }
            console.log('Total reservations loaded:', this.reservations.length);
            console.log('Looking for reservation ID:', id);
            console.log('Available reservation IDs:', this.reservations.map(r => r.id));
            
            const reservation = this.reservations.find(r => r.id === id);
            if (!reservation) {
                console.error('Reservation not found. Available IDs:', this.reservations.map(r => r.id));
                this.showNotification('Error: Reservación no encontrada.', 'error');
                return;
            }
            
            console.log('Reservation found:', reservation);
            console.log('Reservation pricing:', reservation.pricing);
            console.log('Reservation beverages:', reservation.beverages);
            console.log('Reservation entremeses:', reservation.entremeses);

        // Convert logo to base64 for embedding
        let logoBase64 = '';
        try {
            const response = await fetch('Logo_Antesala-removebg-preview.png');
            const blob = await response.blob();
            logoBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Could not load logo image:', error);
            // Fallback to a placeholder or empty string
            logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI3NSIgY3k9Ijc1IiByPSI3MCIgZmlsbD0iI0ZFRUI4NCIgc3Ryb2tlPSIjRjI3QjIxIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4='; // Placeholder circle
        }

        // Format date
        const eventDate = new Date(reservation.eventDate + 'T00:00:00');
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const year = eventDate.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;

        // Generate invoice number (based on year and reservation index)
        const reservationIndex = this.reservations.findIndex(r => r.id === reservation.id) + 1;
        const invoiceNumber = `${new Date().getFullYear()}-${String(reservationIndex).padStart(3, '0')}`;

        // Build itemized list
        let itemsHTML = '';
        
        // Food items
        if (this.isBuffet(reservation.foodType) && reservation.buffet) {
            const buffetItems = [];
            if (reservation.buffet.rice) buffetItems.push(this.getBuffetItemName('rice', reservation.buffet.rice));
            if (reservation.buffet.rice2) buffetItems.push(this.getBuffetItemName('rice', reservation.buffet.rice2));
            if (reservation.buffet.protein1) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein1));
            if (reservation.buffet.protein2) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein2));
            if (reservation.buffet.side) buffetItems.push(this.getBuffetItemName('side', reservation.buffet.side));
            if (reservation.buffet.salad) buffetItems.push(this.getBuffetItemName('salad', reservation.buffet.salad));
            if (reservation.buffet.salad2) buffetItems.push(this.getBuffetItemName('salad', reservation.buffet.salad2));
            if (reservation.buffet.panecillos) buffetItems.push('Panecillos');
            if (reservation.buffet.aguaRefresco) buffetItems.push('Agua y Refresco');
            if (reservation.buffet.pasteles) buffetItems.push('Pasteles');
            
            // Build bullet points for buffet options
            const buffetOptionsList = buffetItems.map(item => `<li style="margin-left: 20px; padding: 2px 0; list-style: disc;">${item}</li>`).join('');
            
            // Show Buffet as a single row with bullet points below
            itemsHTML += `
                <tr>
                    <td>
                        <strong>Buffet</strong>
                        <ul style="margin: 8px 0 0 20px; padding-left: 0; list-style-type: disc;">
                            ${buffetOptionsList}
                        </ul>
                    </td>
                    <td>${reservation.guestCount}</td>
                    <td>$${reservation.pricing.foodCost.toFixed(2)}</td>
                </tr>
            `;
        } else if (reservation.pricing.foodCost > 0 && reservation.foodType && reservation.foodType !== 'no-food') {
            itemsHTML += `
                <tr>
                    <td><strong>${this.getFoodDisplayName(reservation.foodType)}</strong></td>
                    <td>${reservation.guestCount}</td>
                    <td>$${reservation.pricing.foodCost.toFixed(2)}</td>
                </tr>
            `;
        }

        // Breakfast (separate from food service)
        if (reservation.breakfastType && this.isBreakfast(reservation.breakfastType) && reservation.breakfast && reservation.pricing.breakfastCost > 0) {
            const breakfastItems = [];
            if (reservation.breakfast.cafe) breakfastItems.push('Café');
            if (reservation.breakfast.jugo) breakfastItems.push('Jugo');
            if (reservation.breakfast.avena) breakfastItems.push('Avena');
            if (reservation.breakfast.wrapJamonQueso) breakfastItems.push('Wrap de Jamón y Queso');
            if (reservation.breakfast.bocadilloJamonQueso) breakfastItems.push('Bocadillo de Jamón y Queso');
            
            // Build bullet points for breakfast options
            const breakfastOptionsList = breakfastItems.map(item => `<li style="margin-left: 20px; padding: 2px 0; list-style: disc;">${item}</li>`).join('');
            
            // Show Breakfast as a single row with bullet points below
            itemsHTML += `
                <tr>
                    <td>
                        <strong>Desayuno</strong>
                        <ul style="margin: 8px 0 0 20px; padding-left: 0; list-style-type: disc;">
                            ${breakfastOptionsList}
                        </ul>
                    </td>
                    <td>${reservation.guestCount}</td>
                    <td>$${reservation.pricing.breakfastCost.toFixed(2)}</td>
                </tr>
            `;
        }

        // Beverages
        if (reservation.beverages && Object.keys(reservation.beverages).length > 0 && Object.values(reservation.beverages).some(qty => (typeof qty === 'number' && qty > 0) || qty === true)) {
            const items = this.getBeverageItems();
            Object.entries(reservation.beverages).forEach(([id, qty]) => {
                if ((typeof qty === 'number' && qty > 0) || qty === true) {
                    const item = items.find(i => i.id === id);
                    if (item) {
                        let total;
                        // Handle Mimosa separately - it's per person
                        if (id === 'mimosa' && qty === true) {
                            total = 3.95 * reservation.guestCount;
                            itemsHTML += `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${reservation.guestCount}</td>
                                    <td>$${total.toFixed(2)}</td>
                                </tr>
                            `;
                        } else if (typeof qty === 'number' && qty > 0) {
                            total = item.price * qty;
                            itemsHTML += `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${qty}</td>
                                    <td>$${total.toFixed(2)}</td>
                                </tr>
                            `;
                        }
                    }
                }
            });
        }

        // Entremeses
        if (reservation.entremeses && Object.keys(reservation.entremeses).length > 0 && Object.values(reservation.entremeses).some(qty => (typeof qty === 'number' && qty > 0) || qty === true)) {
            const entremesesItems = this.getEntremesesItems();
            Object.entries(reservation.entremeses).forEach(([id, qty]) => {
                // Handle Asopao and Ceviche - they're per person
                if (id === 'asopao' && qty === true) {
                    const total = 3.00 * reservation.guestCount;
                    itemsHTML += `
                        <tr>
                            <td><strong>Asopao</strong></td>
                            <td>${reservation.guestCount}</td>
                            <td>$${total.toFixed(2)}</td>
                        </tr>
                    `;
                } else if (id === 'ceviche' && qty === true) {
                    const total = 3.95 * reservation.guestCount;
                    itemsHTML += `
                        <tr>
                            <td><strong>Ceviche</strong></td>
                            <td>${reservation.guestCount}</td>
                            <td>$${total.toFixed(2)}</td>
                        </tr>
                    `;
                } else if (qty > 0) {
                    // Regular entremeses items
                    const item = entremesesItems.find(e => e.id === id);
                    if (item) {
                        const total = item.price * qty;
                        itemsHTML += `
                            <tr>
                                <td><strong>${item.name}</strong></td>
                                <td>${qty}</td>
                                <td>$${total.toFixed(2)}</td>
                            </tr>
                        `;
                    }
                }
            });
        }

        // Event space (if applicable)
        if (reservation.pricing.roomCost > 0) {
            const durationText = reservation.eventDuration ? ` - ${reservation.eventDuration} hours` : '';
            itemsHTML += `
                <tr>
                    <td><strong>${this.getRoomDisplayName(reservation.roomType)}${durationText}</strong></td>
                    <td>1</td>
                    <td>$${reservation.pricing.roomCost.toFixed(2)}</td>
                </tr>
            `;
        }

        // Additional services - get individual prices
        const servicePrices = {
            'audioVisual': 0, // Manteles has no cost
            'sillas': 0,
            'mesas': 0,
            'decorations': 150,
            'waitstaff': 100,
            'valet': 50
        };
        
        let additionalServicesTotal = 0;
        Object.entries(reservation.additionalServices).forEach(([key, value]) => {
            if (value) {
                const serviceName = this.getServiceName(key);
                const servicePrice = servicePrices[key] || 0;
                additionalServicesTotal += servicePrice;
                if (servicePrice > 0) {
                    itemsHTML += `
                        <tr>
                            <td><strong>${serviceName}</strong></td>
                            <td>1</td>
                            <td>$${servicePrice.toFixed(2)}</td>
                        </tr>
                    `;
                } else {
                    // Manteles (or other free services) - no quantity needed
                    itemsHTML += `
                        <tr>
                            <td><strong>${serviceName}</strong></td>
                            <td>-</td>
                            <td>Incluido</td>
                        </tr>
                    `;
                }
            }
        });

        // Calculate subtotal (before taxes) - use actual additional services total
        const subtotal = reservation.pricing.roomCost + reservation.pricing.foodCost + reservation.pricing.breakfastCost + reservation.pricing.drinkCost + (reservation.pricing.entremesesCost || 0) + additionalServicesTotal;
        
        // Calculate balance: if deposit is paid, subtract it; if not paid, balance equals total
        const balance = reservation.depositPaid 
            ? reservation.pricing.totalCost - reservation.pricing.depositAmount 
            : reservation.pricing.totalCost;

        // Build items array for PDF table
        const itemsData = [];
        
        // Food items
        if (this.isBuffet(reservation.foodType) && reservation.buffet) {
            const buffetItems = [];
            if (reservation.buffet.rice) buffetItems.push(this.getBuffetItemName('rice', reservation.buffet.rice));
            if (reservation.buffet.rice2) buffetItems.push(this.getBuffetItemName('rice', reservation.buffet.rice2));
            if (reservation.buffet.protein1) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein1));
            if (reservation.buffet.protein2) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein2));
            if (reservation.buffet.side) buffetItems.push(this.getBuffetItemName('side', reservation.buffet.side));
            if (reservation.buffet.salad) buffetItems.push(this.getBuffetItemName('salad', reservation.buffet.salad));
            if (reservation.buffet.salad2) buffetItems.push(this.getBuffetItemName('salad', reservation.buffet.salad2));
            if (reservation.buffet.panecillos) buffetItems.push('Panecillos');
            if (reservation.buffet.aguaRefresco) buffetItems.push('Agua y Refresco');
            if (reservation.buffet.pasteles) buffetItems.push('Pasteles');
            
            // For buffet, create description with title and bullet points
            const buffetDesc = 'Buffet\n' + buffetItems.map(item => '• ' + item).join('\n');
            itemsData.push({
                description: buffetDesc,
                qty: reservation.guestCount.toString(),
                total: `$${reservation.pricing.foodCost.toFixed(2)}`,
                isBuffet: true
            });
        } else if (reservation.pricing.foodCost > 0 && reservation.foodType && reservation.foodType !== 'no-food') {
            itemsData.push({
                description: this.getFoodDisplayName(reservation.foodType),
                qty: reservation.guestCount.toString(),
                total: `$${reservation.pricing.foodCost.toFixed(2)}`
            });
        }

        // Breakfast (separate from food service)
        if (reservation.breakfastType && this.isBreakfast(reservation.breakfastType) && reservation.breakfast && reservation.pricing.breakfastCost > 0) {
            const breakfastItems = [];
            if (reservation.breakfast.cafe) breakfastItems.push('Café');
            if (reservation.breakfast.jugo) breakfastItems.push('Jugo');
            if (reservation.breakfast.avena) breakfastItems.push('Avena');
            if (reservation.breakfast.wrapJamonQueso) breakfastItems.push('Wrap de Jamón y Queso');
            if (reservation.breakfast.bocadilloJamonQueso) breakfastItems.push('Bocadillo de Jamón y Queso');
            
            // For breakfast, create description with title and bullet points
            const breakfastDesc = 'Desayuno\n' + breakfastItems.map(item => '• ' + item).join('\n');
            itemsData.push({
                description: breakfastDesc,
                qty: reservation.guestCount.toString(),
                total: `$${reservation.pricing.breakfastCost.toFixed(2)}`,
                isBuffet: true
            });
        }

        // Desserts
        if (reservation.dessertType && this.isDessert(reservation.dessertType) && reservation.dessert) {
            const dessertItems = [];
            if (reservation.dessert.flanQueso) dessertItems.push('Flan de Queso');
            if (reservation.dessert.flanVainilla) dessertItems.push('Flan de Vainilla');
            if (reservation.dessert.flanCoco) dessertItems.push('Flan de Coco');
            if (reservation.dessert.cheesecake) dessertItems.push('Cheesecake');
            if (reservation.dessert.bizcochoChocolate) dessertItems.push('Bizcocho de Chocolate');
            if (reservation.dessert.bizcochoZanahoria) dessertItems.push('Bizcocho de Zanahoria');
            if (reservation.dessert.tresLeches) dessertItems.push('Tres Leches');
            if (reservation.dessert.tembleque) dessertItems.push('Tembleque');
            if (reservation.dessert.postresSurtidos) dessertItems.push('Postres Surtidos');
            
            // For desserts, create description with title and bullet points
            if (dessertItems.length > 0) {
                const dessertDesc = 'Postres\n' + dessertItems.map(item => '• ' + item).join('\n');
                itemsData.push({
                    description: dessertDesc,
                    qty: '-',
                    total: 'Incluido',
                    isBuffet: true
                });
            }
        }

        // Beverages
        if (reservation.beverages && Object.keys(reservation.beverages).length > 0 && Object.values(reservation.beverages).some(qty => (typeof qty === 'number' && qty > 0) || qty === true)) {
            const items = this.getBeverageItems();
            Object.entries(reservation.beverages).forEach(([id, qty]) => {
                // Handle Mimosa separately - it's per person
                if (id === 'mimosa' && qty === true) {
                    const total = 3.95 * reservation.guestCount;
                    itemsData.push({
                        description: 'Mimosa',
                        qty: reservation.guestCount.toString(),
                        total: `$${total.toFixed(2)}`
                    });
                } else if (qty > 0 && typeof qty === 'number') {
                    const item = items.find(i => i.id === id);
                    if (item) {
                        const total = item.price * qty;
                        itemsData.push({
                            description: item.name,
                            qty: qty.toString(),
                            total: `$${total.toFixed(2)}`
                        });
                    }
                }
            });
        }

        // Entremeses
        if (reservation.entremeses && Object.keys(reservation.entremeses).length > 0 && Object.values(reservation.entremeses).some(qty => (typeof qty === 'number' && qty > 0) || qty === true)) {
            const entremesesItems = this.getEntremesesItems();
            Object.entries(reservation.entremeses).forEach(([id, qty]) => {
                if (id === 'asopao' && qty === true) {
                    const total = 3.00 * reservation.guestCount;
                    itemsData.push({
                        description: 'Asopao',
                        qty: reservation.guestCount.toString(),
                        total: `$${total.toFixed(2)}`
                    });
                } else if (id === 'ceviche' && qty === true) {
                    const total = 3.95 * reservation.guestCount;
                    itemsData.push({
                        description: 'Ceviche',
                        qty: reservation.guestCount.toString(),
                        total: `$${total.toFixed(2)}`
                    });
                } else if (qty > 0) {
                    const item = entremesesItems.find(e => e.id === id);
                    if (item) {
                        const total = item.price * qty;
                        itemsData.push({
                            description: item.name,
                            qty: qty.toString(),
                            total: `$${total.toFixed(2)}`
                        });
                    }
                }
            });
        }

        // Event space
        if (reservation.pricing.roomCost > 0) {
            const durationText = reservation.eventDuration ? ` - ${reservation.eventDuration} hours` : '';
            itemsData.push({
                description: `${this.getRoomDisplayName(reservation.roomType)}${durationText}`,
                qty: '1',
                total: `$${reservation.pricing.roomCost.toFixed(2)}`
            });
        }

        // Additional services
        const servicePrices2 = {
            'audioVisual': 0,
            'sillas': 0,
            'mesas': 0,
            'decorations': 150,
            'waitstaff': 100,
            'valet': 50
        };
        
        Object.entries(reservation.additionalServices).forEach(([key, value]) => {
            if (value) {
                const serviceName = this.getServiceName(key);
                const servicePrice = servicePrices2[key] || 0;
                itemsData.push({
                    description: serviceName,
                    qty: servicePrice > 0 ? '1' : '-',
                    total: servicePrice > 0 ? `$${servicePrice.toFixed(2)}` : 'Incluido'
                });
            }
        });

        // Generate PDF directly using jsPDF
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF constructor not available');
        }
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPos = 8;

        // Add logo to top-right corner
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 170, yPos, 25, 25);
            } catch (error) {
                console.warn('Could not add logo to PDF:', error);
            }
        }

        // Company name and info - start higher up
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('LA ANTESALA BY FUSION', 105, yPos + 5, { align: 'center' });
        yPos += 12;

        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Avenida Hostos 105, Ponce, PR 00717', 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text('Tel. 787-428-2228', 105, yPos, { align: 'center' });
        yPos += 8;

        // Invoice header
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;

        // Client info (two columns for space efficiency)
        // Show company name if available
        if (reservation.companyName) {
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`Company: ${reservation.companyName}`, 20, yPos);
            yPos += 5;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('ISSUED TO:', 20, yPos);
        doc.text('INVOICE NO:', 140, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(13);
        doc.text(`A: ${reservation.clientName}`, 20, yPos);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        doc.text(invoiceNumber, 190, yPos, { align: 'right' });
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(13);
        doc.text(`Tel: ${reservation.clientPhone}`, 20, yPos);
        yPos += 5;
        doc.text(`Actividad: ${reservation.eventType || 'Evento'}`, 20, yPos);
        yPos += 5;
        doc.text(`Día: ${formattedDate}`, 20, yPos);
        yPos += 5;
        doc.text(`Hora: ${this.formatTime12Hour(reservation.eventTime)}`, 20, yPos);
        yPos += 8;

        // Items table
        doc.setLineWidth(0.4);
        doc.setDrawColor(45, 55, 72);
        doc.line(20, yPos, 190, yPos);
        yPos += 4;

        // Table header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(45, 55, 72);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.text('DESCRIPTION', 25, yPos);
        doc.text('QTY', 140, yPos);
        doc.text('TOTAL', 190, yPos, { align: 'right' });
        yPos += 8;
        doc.setTextColor(0, 0, 0);

        // Table rows
        doc.setFont(undefined, 'normal');
        doc.setFontSize(13);
        itemsData.forEach(item => {
            const description = typeof item.description === 'string' ? item.description : '';
            
            // Handle buffet with bullet points
            if (item.isBuffet) {
                const lines = description.split('\n');
                lines.forEach((line, index) => {
                    if (line.trim()) {
                        doc.setFont(undefined, index === 0 ? 'bold' : 'normal');
                        const xPos = index === 0 ? 25 : 30;
                        doc.text(line, xPos, yPos);
                        
                        if (index === 0) {
                        doc.text(item.qty, 140, yPos);
                        doc.text(item.total, 190, yPos, { align: 'right' });
                        }
                        yPos += index === 0 ? 8 : 6;
                    }
                });
            } else {
                doc.setFont(undefined, 'bold');
                const descLines = doc.splitTextToSize(description, 110);
                doc.text(descLines, 25, yPos);
                doc.setFont(undefined, 'normal');
                doc.text(item.qty, 140, yPos);
                doc.text(item.total, 190, yPos, { align: 'right' });
                yPos += Math.max(8, descLines.length * 6);
            }
            // Add spacing between items
            yPos += 2;
        });

        // Financial summary
        yPos += 6;

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;

        doc.setFontSize(13);
        doc.setFont(undefined, 'normal');
        doc.text('SUB-TOTAL', 20, yPos);
        doc.text(`$${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });
        yPos += 5;

        doc.text('TAXES AND FEE', 20, yPos);
        doc.text(`$${reservation.pricing.taxes.totalTaxes.toFixed(2)}`, 190, yPos, { align: 'right' });
        yPos += 5;

        if (reservation.pricing.tip && reservation.pricing.tip.amount > 0) {
            doc.text(`PROPINA ${reservation.pricing.tip.percentage}%`, 20, yPos);
            doc.text(`$${reservation.pricing.tip.amount.toFixed(2)}`, 190, yPos, { align: 'right' });
            yPos += 5;
        }

        doc.setFontSize(15);
        doc.setFont(undefined, 'bold');
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        doc.text('TOTAL', 20, yPos);
        doc.text(`$${reservation.pricing.totalCost.toFixed(2)}`, 190, yPos, { align: 'right' });
        yPos += 6;

        doc.setFontSize(14);
        doc.setTextColor(242, 123, 33);
        doc.text('Deposito a Pagar', 20, yPos);
        const depositAmount = reservation.pricing.depositAmount || 0;
        let depositText = `$${depositAmount.toFixed(2)}`;
        if (reservation.depositPaid) {
            depositText += ' - PAID';
        }
        doc.text(depositText, 190, yPos, { align: 'right' });
        yPos += 6;

        doc.setTextColor(72, 187, 120);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        doc.text('Balance', 20, yPos);
        doc.text(`$${balance.toFixed(2)}`, 190, yPos, { align: 'right' });

        // Add new page for Terms and Conditions
        doc.addPage();
        
        // Terms and Conditions Header
        let termsYPos = 20;
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Términos y Condiciones – Salón de Actividades', 105, termsYPos, { align: 'center' });
        termsYPos += 15;

        // Terms and Conditions Content
        doc.setFontSize(13);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const termsText = `1. Reservación y Pago

La reservación se garantiza con un depósito del 20% del monto total del evento. El balance restante deberá ser pagado en su totalidad a más tardar 1 día antes de la fecha del evento. Todos los pagos realizados son no reembolsables.

2. Cambios de Fecha

Los cambios de fecha están sujetos a disponibilidad. Solo se permitirán cambios solicitados con al menos 5 días de anticipación.

3. Cancelaciones

Las cancelaciones deben realizarse por escrito. Pagos no reembolsables y no transferibles a otras fechas o servicios, salvo disposición a situación emergencia ya sea muerte o catástrofe natural.

4. Duración del Evento

El cliente dispone del salón por un máximo de 5 horas. Horas adicionales tendrán un costo extra por hora. El horario debe respetarse estrictamente.

5. Decoración y Montaje

No se permite clavar, pegar o perforar paredes, techos o mobiliario. El cliente es responsable de retirar decoraciones al finalizar el evento.

6. Catering y Bebidas

El salón ofrece servicio de alimentos y bebidas, por lo tanto, queda prohibido introducir servicios externos de ninguna índole. Puede aplicarse cargo si lleva bebidas o comida externa eso incluye, candy bar, mesas de postres, charcuterías. Botellas de vinos o champagne tendrán un cargo por descorche según la marca.

7. Seguridad y Daños

El cliente será responsable por cualquier daño causado al salón, mobiliario o equipo durante el evento. El salón se reserva el derecho de exigir depósito de seguridad reembolsable para cubrir daños.

8. Conducta y Normas

El cliente y sus invitados deben comportarse de manera adecuada. El salón se reserva el derecho de terminar el evento en cualquier momento, en caso de conducta inapropiada o incumplimiento de normas.

9. Fuerza Mayor

El restaurante no se hace responsable por cancelaciones debidas a eventos fuera de nuestro control (clima severo, fallas eléctricas externas, desastres naturales, emergencias gubernamentales, etc.). Se ofrecerán alternativas razonables según disponibilidad.

10. Firma y Aceptación

El cliente reconoce haber leído y aceptado estos términos y condiciones al firmar el contrato de reservación.

11. Confeti y Pirotecnia

Queda estrictamente prohibido el uso de confeti, serpentinas, pirotecnia, fuegos artificiales o cualquier material similar dentro o fuera del salón. El uso de estos elementos puede causar daños al salón, representar un riesgo de seguridad y generar costos adicionales de limpieza. El cliente será responsable de cualquier daño o costo adicional resultante del uso no autorizado de estos materiales. En caso de incumplimiento, el salón se reserva el derecho de aplicar cargos adicionales y/o terminar el evento inmediatamente.`;

        // Split text into lines and format
        const termsLines = doc.splitTextToSize(termsText, 170);
        
        // Draw each line with proper spacing
        termsLines.forEach((line, index) => {
            // Check if we need a new page (A4 height is 297mm, leave space at bottom for signature)
            if (termsYPos > 250) {
                doc.addPage();
                termsYPos = 20;
            }
            
            // Check if line starts with a number (section header)
            if (/^\d+\./.test(line.trim())) {
                doc.setFont(undefined, 'bold');
                // Less space before "9. Fuerza Mayor" to keep it closer to previous section
                if (line.trim().startsWith('9.')) {
                    termsYPos += 1; // Reduced space before section 9
                } else {
                    termsYPos += 3; // Extra space before section
                }
            } else {
                doc.setFont(undefined, 'normal');
            }
            
            doc.text(line, 20, termsYPos);
            termsYPos += 4; // Line spacing
        });

        // Signature section - both on left side
        termsYPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, termsYPos, 120, termsYPos); // Signature line
        termsYPos += 5;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(74, 85, 104);
        doc.text('Firma del Cliente', 20, termsYPos);
        
        // Date line - also on left side
        termsYPos += 15;
        doc.line(20, termsYPos - 10, 120, termsYPos - 10); // Date line on left
        doc.text('Fecha', 20, termsYPos);

        // Save PDF
        const fileName = `Invoice-${invoiceNumber}-${reservation.clientName.replace(/\s+/g, '-')}.pdf`;
        doc.save(fileName);
        
        this.showNotification('¡Factura exportada exitosamente como PDF!', 'success');
        } catch (error) {
            console.error('Error exporting invoice:', error);
            this.showNotification(`Error al exportar factura: ${error.message}. Por favor, verifica la consola del navegador para más detalles.`, 'error');
        }
    }

    // Export reservations (bonus feature)
    exportReservations() {
        const dataStr = JSON.stringify(this.reservations, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reservations-backup.json';
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('¡Reservaciones exportadas exitosamente!', 'success');
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Dark Mode Functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDarkMode = savedTheme === 'dark';
    
    // Apply the theme
    if (isDarkMode) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateDarkModeIcon(true);
    } else {
        htmlElement.removeAttribute('data-theme');
        updateDarkModeIcon(false);
    }
    
    // Toggle dark mode on button click
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const isCurrentlyDark = currentTheme === 'dark';
            
            if (isCurrentlyDark) {
                // Switch to light mode
                htmlElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateDarkModeIcon(false);
            } else {
                // Switch to dark mode
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateDarkModeIcon(true);
            }
        });
    }
}

function updateDarkModeIcon(isDarkMode) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        const text = darkModeToggle.querySelector('span');
        if (icon) {
            if (isDarkMode) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
        if (text) {
            text.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
        }
    }
}

// Initialize the reservation manager when the page loads
let reservationManager;
document.addEventListener('DOMContentLoaded', () => {
    // Demo banner handling
    const demoBanner = document.getElementById('demo-banner');
    const demoBannerClose = document.getElementById('demoBannerClose');
    const appContainer = document.querySelector('.app-container');
    
    // Check if banner was previously closed
    const bannerClosed = localStorage.getItem('demoBannerClosed') === 'true';
    
    if (demoBanner) {
        if (bannerClosed) {
            demoBanner.classList.add('hidden');
            if (appContainer) {
                appContainer.style.paddingTop = '0';
            }
        } else {
            demoBanner.classList.remove('hidden');
            if (appContainer) {
                appContainer.style.paddingTop = '60px';
            }
        }
    }
    
    // Close button functionality
    if (demoBannerClose) {
        demoBannerClose.addEventListener('click', () => {
            if (demoBanner) {
                demoBanner.classList.add('hidden');
                localStorage.setItem('demoBannerClosed', 'true');
                if (appContainer) {
                    appContainer.style.paddingTop = '0';
                    appContainer.style.transition = 'padding-top 0.3s ease';
                }
            }
        });
    }
    
    // Check if jsPDF libraries loaded
    const checkLibraries = () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.warn('jsPDF library not detected. Checking again in 1 second...');
            setTimeout(checkLibraries, 1000);
            return;
        }
        console.log('✓ jsPDF library loaded successfully');
    };
    // Start checking after a short delay to allow scripts to load
    setTimeout(checkLibraries, 500);
    
    reservationManager = new ReservationManager();
    // Make reservationManager globally accessible for debugging
    window.reservationManager = reservationManager;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;
    
    // Initialize dark mode
    initializeDarkMode();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    document.getElementById('saveBtn').click();
                    break;
                case 'Enter':
                    e.preventDefault();
                    document.getElementById('calculateBtn').click();
                    break;
            }
        }
    });
});

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    if (reservationManager) {
        reservationManager.showSection(sectionId);
    }
}

function clearForm() {
    if (reservationManager) {
        reservationManager.clearForm();
    }
}

function exportReservations() {
    if (reservationManager) {
        reservationManager.exportReservations();
    }
}

function previousMonth() {
    if (reservationManager) {
        reservationManager.previousMonth();
    }
}

function nextMonth() {
    if (reservationManager) {
        reservationManager.nextMonth();
    }
}

function exportReservationInvoice(id) {
    console.log('Export button clicked, ID:', id);
    
    // Check if ReservationManager is initialized
    if (!reservationManager) {
        console.error('ReservationManager not initialized');
        alert('Error: El sistema no se ha inicializado correctamente. Por favor, recarga la página.');
        return;
    }
    
    // Check if jsPDF is loaded before attempting export
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error('jsPDF not loaded. Script status:', {
            'window.jspdf exists': !!window.jspdf,
            'window.jspdf.jsPDF exists': !!(window.jspdf && window.jspdf.jsPDF),
            'all scripts loaded': document.readyState
        });
        
        const errorMsg = 'Error: Las librerías de PDF no se cargaron correctamente.\n\n' +
                        'Posibles causas:\n' +
                        '• Conexión a internet bloqueada o lenta\n' +
                        '• Firewall/proxy bloqueando CDN (cdnjs.cloudflare.com)\n' +
                        '• Extensiones del navegador bloqueando scripts\n' +
                        '• Problemas de seguridad del navegador\n\n' +
                        'Por favor:\n' +
                        '1. Verifica tu conexión a internet\n' +
                        '2. Revisa la consola del navegador (F12) para más detalles\n' +
                        '3. Intenta recargar la página\n' +
                        '4. Desactiva extensiones que puedan bloquear scripts';
        alert(errorMsg);
        return;
    }
    
    // Proceed with export
    reservationManager.exportReservationInvoice(id);
}