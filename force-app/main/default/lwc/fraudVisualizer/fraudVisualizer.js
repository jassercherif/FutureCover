import { LightningElement, api, wire } from 'lwc';
import getReimbursementById from '@salesforce/apex/ReimbursementsController.getReimbursementById';

export default class FraudVisualizer extends LightningElement {
    @api recordId; // fourni automatiquement sur une page d'enregistrement
    latestScore = 0;
    latestDetails = '';

    @wire(getReimbursementById, { recordId: '$recordId' })
    wiredReimbursement({ error, data }) {
        if (data) {
            this.latestScore = data.Fraud_Score__c || 0;
            this.latestDetails = data.Fraud_Details__c || 'No details provided.';
        } else if (error) {
            console.error('Erreur lors de la récupération du remboursement', error);
        }
    }

    get progressBarStyle() {
        let color = 'green';
        if (this.latestScore > 75) {
            color = 'red';
        } else if (this.latestScore > 50) {
            color = 'orange';
        }
        return `width: ${this.latestScore}%; background-color: ${color};`;
    }

    get hasDetails() {
        return this.latestDetails && this.latestDetails.trim().length > 0;
    }
}
