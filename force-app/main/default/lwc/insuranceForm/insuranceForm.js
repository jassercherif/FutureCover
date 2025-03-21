import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class SubmitLead extends LightningElement {
    @track lead = {
        firstName: '',
        lastName: '',
        email: '',
        title: '', // Ajout du champ title
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

    insuranceOptions = [
        { label: 'Life Insurance', value: 'Life Insurance' },
        { label: 'Health Insurance', value: 'Health Insurance' },
        { label: 'Car Insurance', value: 'Car Insurance' },
        { label: 'Travel Insurance', value: 'Travel Insurance' }
    ];

    @track message = '';
    @track error = '';

    handleChange(event) {
        const field = event.target.dataset.id;
        this.lead = { ...this.lead, [field]: event.target.value };
    }
    
    
    // Soumettre le formulaire
    async handleSubmit() {
        try {
            const result = await createLead({
                firstName: this.lead.firstName,
                lastName: this.lead.lastName,
                email: this.lead.email,
                title: this.lead.title, // Assurez-vous que le titre est inclus
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
            this.message = result;
            this.error = '';
        } catch (error) {
            this.error = 'Erreur: ' + error.body.message;
            this.message = '';
        }
    }
}
