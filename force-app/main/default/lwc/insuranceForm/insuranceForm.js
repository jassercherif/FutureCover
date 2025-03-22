import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';
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
        insuranceAddress: '',
        country: '',
        city: '',
        stateProvince: '',
        productInterest: ''
    };

    @track errorMessages = {};
    
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
                insuranceAddress: this.lead.insuranceAddress,
                country: this.lead.country,
                city: this.lead.city,
                stateProvince: this.lead.stateProvince,
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
