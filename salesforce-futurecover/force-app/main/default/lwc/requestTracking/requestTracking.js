// suiviCommande.js
import { LightningElement, track, wire } from 'lwc';
import getOpportunityStatusWithContactInfo from '@salesforce/apex/OpportunityController.getOpportunityStatusWithContactInfo';

export default class SuiviCommande extends LightningElement {
    @track currentStep = '1';
    @track contactName;
    @track error;
    opportunityStatus;

    @wire(getOpportunityStatusWithContactInfo)
    wiredOpportunityStatus({ error, data }) {
        if (data) {
            console.log('Données récupérées:', JSON.stringify(data));
            this.opportunityStatus = data;
            this.contactName = data.ContactName;
            const opportunityStageName = data.StageName;

            const stageToStepMap = {
                'Prospecting': '1',
                'Qualification': '2',
                'Proposal/Price Quote': '3',
                'Contract Preparation': '4',
                'Contract Decision': '4',
                'Closed Won': '6',
                'Closed Lost': '6'
            };

            this.currentStep = stageToStepMap[opportunityStageName] || '1';
        } else if (error) {
            this.error = error;
            console.error('Erreur lors de la récupération du statut de l\'opportunité:', error);
            this.opportunityStatus = undefined;
        }
    }

    get isStepOne() {
        return this.currentStep === '1';
    }

    get isStepTwo() {
        return this.currentStep === '2';
    }

    get isStepThree() {
        return this.currentStep === '3';
    }

    get isStepFour() {
        return this.currentStep === '4';
    }
    get isStepFive() {
        return this.currentStep === '5';
    }
    get isStepSix() {
        return this.currentStep === '6';
    }
    get isClosedWon() {
        return this.currentStep === '6' && this.opportunityStatus?.StageName === 'Closed Won';
    }

    get isClosedLost() {
        return this.currentStep === '6' && this.opportunityStatus?.StageName === 'Closed Lost';
    }
}
