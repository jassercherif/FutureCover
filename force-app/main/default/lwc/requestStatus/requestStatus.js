import { LightningElement, wire, track } from 'lwc';
import   getOpportunityStatusWithContactInfo from '@salesforce/apex/OpportunityController.getOpportunityStatusWithContactInfo';
export default class OpportunityProgressBar extends LightningElement {
    @track opportunityName;
    @track stageName;
    @track error;
    @track steps = [
            { label: 'Prospecting', value: 'Prospecting', className: 'slds-progress__item' },
            { label: 'Qualification', value: 'Qualification', className: 'slds-progress__item' },
            { label: 'Needs Analysis', value: 'Needs Analysis', className: 'slds-progress__item' },
            { label: 'Value Proposition', value: 'Value Proposition', className: 'slds-progress__item' },
            { label: 'Id. Decision Makers', value: 'Id. Decision Makers', className: 'slds-progress__item' },
            { label: 'Perception Analysis', value: 'Perception Analysis', className: 'slds-progress__item' },
            { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote', className: 'slds-progress__item' },
            { label: 'Negotiation/Review', value: 'Negotiation/Review', className: 'slds-progress__item' },
            { label: 'Closed Won', value: 'Closed Won', className: 'slds-progress__item' },
            { label: 'Closed Lost', value: 'Closed Lost', className: 'slds-progress__item' }
        
    ];

    @wire(getOpportunityStatusWithContactInfo)
    wiredOpportunity({ error, data }) {
        if (data) {
            if (data.error) {
                this.error = data.error;
                this.opportunityName = undefined; 
                this.stageName = undefined;
            } else {
                this.opportunityName = data.OpportunityName;
                this.stageName = data.StageName;
                this.updateProgress(); 
            }
        } else if (error) {
            this.error = error.body?.message || 'Erreur lors de la récupération des données.';
            this.opportunityName = undefined; 
            this.stageName = undefined;
        }
    }

    // Met à jour les étapes de la barre de progression en fonction du stageName actuel
    updateProgress() {
        const currentStepIndex = this.steps.findIndex(step => step.value === this.stageName);
        if (currentStepIndex !== -1) {
            this.steps = this.steps.map((step, index) => {
                if (index < currentStepIndex) {
                    return { ...step, className: 'slds-progress__item slds-is-completed' };
                } else if (index === currentStepIndex) {
                    return { ...step, className: 'slds-progress__item slds-is-active' };
                } else {
                    return { ...step, className: 'slds-progress__item' };
                }
            });
        }
    }

    // Calcule la largeur de la barre de progression en fonction du stageName
    get progressBarStyle() {
        const currentStepIndex = this.steps.findIndex(step => step.value === this.stageName);
        const progressPercentage = ((currentStepIndex + 1) / this.steps.length) * 100;
        return `width: ${progressPercentage}%; background-color: #0070d2;`; // Bleu Salesforce
    }

    // Getter pour afficher l'opportunité et son état
    get showOpportunityInfo() {
        return this.opportunityName && this.stageName;
    }
}
