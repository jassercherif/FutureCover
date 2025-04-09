import { LightningElement, track } from 'lwc';
import Quote from '@salesforce/resourceUrl/Quote';
export default class QuoteDecision extends LightningElement {
    imageUrl = Quote; // Mets ici ton image
    @track showRejectReason = false;
    @track rejectionReason = '';

    handleAccept() {
        // Logique pour accepter le devis
        console.log('Quote accepted.');
        alert('Quote accepted successfully.');
    }

    toggleReject() {
        this.showRejectReason = true;
    }

    handleReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    submitRejection() {
        if (this.rejectionReason.trim() === '') {
            alert('Please provide a reason for rejection.');
            return;
        }
        // Logique pour rejeter avec raison
        console.log('Quote rejected. Reason:', this.rejectionReason);
        alert(`Quote rejected for the following reason:\n${this.rejectionReason}`);
    }
}
