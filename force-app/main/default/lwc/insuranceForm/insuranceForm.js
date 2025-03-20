import { LightningElement, track } from 'lwc';
import createLead from '@salesforce/apex/LeadController.createLead';

export default class SubmitLead extends LightningElement {
    @track lead = {
        firstName: '',
        lastName: '',
        email: '',
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
    @track message = '';
    @track error = '';

    handleChange(event) {
        this.lead[event.target.dataset.id] = event.target.value;
    }

    async handleSubmit() {
        try {
            const result = await createLead({
                firstName: this.lead.firstName,
                lastName: this.lead.lastName,
                email: this.lead.email,
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
