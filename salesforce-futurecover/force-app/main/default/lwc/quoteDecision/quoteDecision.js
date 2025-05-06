import { LightningElement, track } from 'lwc';
import RejectedQuote from '@salesforce/apex/QuoteService.RejectedQuote';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import Quote from '@salesforce/resourceUrl/Quote';
import AcceptedQuote from '@salesforce/apex/QuoteService.AcceptedQuote';

export default class QuoteDecision extends NavigationMixin(LightningElement) {
    imageUrl = Quote;
    @track showRejectReason = false;
    @track rejectionReason = '';

    handleAccept() {
        // Vérifier si l'ID de l'Opportunity est bien défini
        /*if (!this.opportunityId) {
            this.showToast('Missing Information', 'Opportunity ID is required to accept.', 'warning', 'dismissable');
            return;
        }*/
    
        // Appel à la méthode Apex pour accepter l'Opportunity
        AcceptedQuote({ opportunityId: this.opportunityId })
        .then(result => {
            // Affichage d'un toast de succès si l'Opportunity a été mise à jour
            this.showToast('Success', 'Opportunity has been accepted and status updated to "Contract Signature Pending".', 'success', 'dismissable');
            this.navigateToContractPage();  // Redirection vers la page de suivi ou de contrat
        }).catch(error => {
            // Gestion des erreurs et affichage d'un toast en cas de problème
            this.showToast('Error', error.body.message, 'error', 'dismissable');
        });
    
        this.handleClick();  // Logique pour fermer ou nettoyer d'autres éléments si nécessaire
    }
    

    toggleReject() {
        this.showRejectReason = true;
    }

    handleReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    submitRejection() {
        if (this.rejectionReason.trim() === '') {
            this.showToast('Missing Information', 'Please provide a reason for rejection.', 'warning', 'dismissable');
            return;
        }

        RejectedQuote({ reason: this.rejectionReason })
        .then(result => {
            this.showToast('Success', 'Your rejection has been submitted.', 'success', 'dismissable');
            this.showRejectReason = false;
            this.navigateToFollowUpPage();
        }).catch(error => {
            this.showToast('Error', error.body.message, 'error', 'dismissable');
        });
        this.handleClick();
    }

    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
            mode
        });
        this.dispatchEvent(event);
    }
    navigateToFollowUpPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/request-status'
            }
        });
    }
    handleClick() {
        window.location.reload();
    }
    
}
