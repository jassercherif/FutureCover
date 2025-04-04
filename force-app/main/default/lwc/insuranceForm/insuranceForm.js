import { LightningElement, track, wire } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';
import formBackground from '@salesforce/resourceUrl/formBackground';
import getAllProducts from '@salesforce/apex/ProductController.getAllProducts';
import { NavigationMixin } from 'lightning/navigation';

export default class SubmitLead extends NavigationMixin(LightningElement) {
    @track lead = {
        firstName: '',
        lastName: '',
        email: '',
        title: '',
        phone: '',
        mobile: '',
        company: '',
        numEmployees: '',
        annualRevenue: '',
        insuranceType: '',
        Address: '',
        productInterest: ''
    };
    @track errorMessages = {};
    @track productOptions = []; // Stocke la liste des produits
    @track productId;
    @track productName;
    @wire(getAllProducts)
    wiredProducts({ error, data }) {
        if (data && Array.isArray(data)) {
            this.productOptions = data.map(product => ({
                label: product?.Name || 'Unknown Product',  // Vérifie si Name existe
                value: product?.Id || ''                   // Vérifie si Id existe
            }));
        } else if (error) {
            console.error('Error loading products:', error);
        }
    }
    // Cette méthode est appelée au chargement de la page
    connectedCallback() {
        const productId = sessionStorage.getItem('productId');
        const productName = sessionStorage.getItem('productName');
        
        if (productId && productName) {
            this.lead.productInterest = productId;
            console.log('Product Name:', productName); // Affiche le nom du produit dans la console
        } else {
            console.log('Product information not found in sessionStorage');
        }
    }
    
    
    

    handleChangeProduct(event) {
        this.lead.productInterest = event.detail.value; // Met à jour le champ sélectionné
    }
    
    insuranceOptions = [
        { label: 'Life Insurance', value: 'Life Insurance' },
        { label: 'Health Insurance', value: 'Health Insurance' },
        { label: 'Car Insurance', value: 'Car Insurance' },
        { label: 'Travel Insurance', value: 'Travel Insurance' }
    ];

    @track error = '';

    handleChange(event) {
        const field = event.target.dataset.id;
        const value = event.target.value;
        this.lead = { ...this.lead, [field]: value }; 
    }

    async handleSubmit() {
        try {
            this.errorMessages = {};  // Reset error messages

            // Vérification des champs obligatoires
            if (!this.lead.firstName || !this.lead.lastName) {
                this.errorMessages.firstName = 'The Name is required.';
            }
            if (!this.lead.email) {
                this.errorMessages.email = 'Email is required.';
            }
            if (!this.lead.phone) {
                this.errorMessages.phone = 'Phone is required.';
            }
            if (!this.lead.title) {
                this.errorMessages.title = 'Title is required.';
            }

            // Vérification de l'email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (this.lead.email && !emailRegex.test(this.lead.email)) {
                this.errorMessages.email = 'Please enter a valid email address.';
            }

            // Vérification du format du téléphone
            const phoneRegex = /^[0-9]{8}$/;
            if (this.lead.phone && !phoneRegex.test(this.lead.phone)) {
                this.errorMessages.phone = 'Please enter a valid phone number (8 digits).';
            }

            // Vérification du champ "Number of Employees"
            if (this.lead.numEmployees && isNaN(this.lead.numEmployees)) {
                this.errorMessages.numEmployees = 'Please enter a valid number for the number of employees.';
            }

            // Vérification du champ "Annual Revenue"
            if (this.lead.annualRevenue && isNaN(this.lead.annualRevenue)) {
                this.errorMessages.annualRevenue = 'Please enter a valid number for annual revenue.';
            }
            if (!this.lead.insuranceType) {
                this.errorMessages.insuranceType = 'Insurance Type is required.';
            }
            if (!this.lead.company) {
                this.errorMessages.company = 'Company is required.';
            }
            // Vérification du champ "Address"
            if (!this.lead.address) {
                this.errorMessages.address = 'Address is required.';
            }
            

            // Si des erreurs existent, ne pas soumettre
            if (Object.keys(this.errorMessages).length > 0) {
                throw new Error('Please fill out all required fields correctly.');
            }

            // Soumettre les données
            const result = await createLead({
                firstName: this.lead.firstName,
                lastName: this.lead.lastName,
                email: this.lead.email,
                title: this.lead.title,
                phone: this.lead.phone,
                mobile: this.lead.mobile,
                company: this.lead.company,
                numEmployees: this.lead.numEmployees ? parseInt(this.lead.numEmployees, 10) : null,
                annualRevenue: this.lead.annualRevenue ? parseFloat(this.lead.annualRevenue) : null,
                insuranceType: this.lead.insuranceType,
                Address: this.lead.address,
                
                productInterest: this.lead.productInterest
            });

            // Rediriger vers la page de confirmation
            this[NavigationMixin.Navigate]( {
                type: 'standard__webPage',
                attributes: {
                    url: '/lead-submitted' 
                }
            });
        } catch (error) {
            console.error(error); 
            this.error = error.message || 'Please make sure all required fields are filled in correctly.';
        }
    }
}
