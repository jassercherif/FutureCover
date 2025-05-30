import { LightningElement, api, wire } from 'lwc';
import getReimbursementById from '@salesforce/apex/ReimbursementsController.getReimbursementById';

export default class FraudDetails extends LightningElement {
    @api recordId;
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
        let color = '#04844b'; // Vert
        if (this.latestScore > 75) {
            color = '#c23934'; // Rouge
        } else if (this.latestScore > 50) {
            color = '#ffb75d'; // Orange
        }
        return `width: ${this.latestScore}%; background-color: ${color};`;
    }

    get scoreClass() {
        if (this.latestScore > 75) {
            return 'high-risk';
        } else if (this.latestScore > 50) {
            return 'medium-risk';
        }
        return 'low-risk';
    }

    get hasDetails() {
        return this.latestDetails && this.latestDetails.trim().length > 0;
    }

    get formattedDetails() {
        if (!this.hasDetails) return [];
        
        // Supposons que les détails sont séparés par des sauts de ligne
        return this.latestDetails.split('\n')
            .filter(line => line.trim().length > 0)
            .map((line, index) => {
                // Détection simple de la sévérité basée sur le contenu
                let severity = 'medium';
                if (line.toLowerCase().includes('high') || line.includes('!!!')) {
                    severity = 'high';
                } else if (line.toLowerCase().includes('low') || line.includes('(L)')) {
                    severity = 'low';
                }
                
                return {
                    key: `detail-${index}`,
                    text: line,
                    severity: severity
                };
            });
    }
}