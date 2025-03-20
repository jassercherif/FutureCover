import { LightningElement, track } from 'lwc';

export default class LeadForm extends LightningElement {
    @track lead = {
        firstName: '',
        lastName: '',
        phone: '',
        mobile: '',
        email: '',
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
    
    @track error;

    // Gérer les changements dans les champs du formulaire
    handleChange(event) {
        const field = event.target.dataset.id;
        this.lead[field] = event.target.value;
    }

    // Soumettre les données du formulaire
    handleSubmit() {
        // Logique pour soumettre les données (par exemple, appel Apex ou autre logique)
        console.log('Lead Submitted:', this.lead);

        // Exemple de confirmation ou de gestion d'erreur
        if (this.lead.firstName && this.lead.lastName && this.lead.phone && this.lead.email) {
            alert('Lead submitted successfully!');
        } else {
            this.error = 'Please fill out all required fields.';
        }
    }
}
