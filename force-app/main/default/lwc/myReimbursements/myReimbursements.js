import { LightningElement, wire,track } from 'lwc';
import getReimbursementsForCurrentUser from '@salesforce/apex/ReimbursementsController.getReimbursementsForCurrentUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
//import { refreshApex } from '@salesforce/apex';
import getCurrentUserContactId from '@salesforce/apex/ReimbursementsController.getCurrentUserContactId';
import { NavigationMixin } from 'lightning/navigation';
import getCoverageLimitForCurrentUser from '@salesforce/apex/ReimbursementsController.getCoverageLimitForCurrentUser';
import getJustificatifDownloadUrl from '@salesforce/apex/ReimbursementsController.getJustificatifDownloadUrl';



const COLUMNS = [
    { label: 'Request Name', fieldName: 'Name', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Date', fieldName: 'Date__c', type: 'date', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Amount', fieldName: 'Amount__c', type: 'currency', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Pack', fieldName: 'Pack__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Type', fieldName: 'Type__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Status', fieldName: 'Status__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    {
        type: "button", 
        typeAttributes: {
            label: 'View Details',
            name: 'view',
            title: 'View Details',
            value: 'view',
            disabled: { fieldName: 'isEditDisabled' }
        }, 
        cellAttributes: { class: { fieldName: 'cellClass' } }
    }
];

export default class MyReimbursements extends NavigationMixin(LightningElement) {
    columns = COLUMNS;

    reimbursements = [];
    reimbursementsWireResult;
    showModalPopup = false;
    objectApiName = 'Reimbursement_Request__c';
    recordId = '';
    currentUserId = Id;
    contactId;
    @track attachments = [];
    @track coverageLimit=0;
    @track selectedRemboursement = {};
    

// Nouvelle méthode pour le téléchargement




loadCoverageLimit() {
    getCoverageLimitForCurrentUser()
        .then(result => {
            this.coverageLimit = result;
            console.log('Plafond de remboursement : ', this.coverageLimit);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du plafond : ', error);
            this.coverageLimit = null;
        });
}
    
    
    
connectedCallback() {
    this.loadCoverageLimit();
    getCurrentUserContactId()
        .then(result => {
            this.contactId = result;
           // refreshApex(this.reimbursementsWireResult);
        })
        .catch(error => {
            console.error('Error fetching contactId', error);
        });
}

    @wire(getReimbursementsForCurrentUser)
    wiredReimbursements(result) {
        this.reimbursementsWireResult = result;
        if (result.data) {
            this.reimbursements = result.data.map(r => ({ 
                ...r,
                cellClass: r.Status__c == 'Approved' ? 'slds-theme_success' : 
                           r.Status__c == 'Rejected' ? 'slds-theme_error' : 
                           r.Status__c == 'In Review' ? 'slds-theme_warning' : '',

            }));
            
                        /*this[NavigationMixin.Navigate]( {
                            type: 'standard__webPage',
                            attributes: {
                                url: '/request-status' 
                            }
                        });*/
                        this.handleClick();
                        
            
        }
        if (result.error) {
            console.error('Error fetching reimbursements: ', result.error);
        }
    }

    get noRecordsFound() {
        return this.reimbursements.length === 0;
    }

    newRequestClickHandler() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/getreimbursed'
            }
        });
        /*this.showModalPopup = true;
        this.recordId = '';*/
    }

    popupCloseHandler() {
        this.showModalPopup = false;
    }
    

    async rowActionHandler(event) {
        const row = event.detail.row;
        this.recordId = row.Id;
        
        try {
            const fileUrl = await getJustificatifDownloadUrl({ remboursementId: row.Id });
            console.log('URL obtenue:', fileUrl); // Debug
            
            if (!fileUrl) {
                this.showToast(
                    'Le justificatif existe mais n\'a pas pu être récupéré. Contactez l\'administrateur.',
                    'Avertissement',
                    'warning'
                );
                return;
            }

            this.selectedRemboursement = {
                ...row,
                FileUrl: fileUrl
            };
            this.showModalPopup = true;

        } catch (error) {
            console.error('Erreur détaillée:', JSON.stringify(error));
            this.showToast(
                'Erreur technique lors de la récupération du justificatif',
                'Erreur',
                'error'
            );
            this.selectedRemboursement = row;
        this.showModalPopup = true;
        }
    }

    handleOpenPreviewInNewWindow() {
        if (this.selectedRemboursement?.FileUrl) {
            window.open(this.selectedRemboursement.FileUrl, '_blank');
        } else {
            console.error('Pas de lien de fichier disponible');
        }
    }

    showToastt(message, title, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

  
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        let fileNames = uploadedFiles.map(file => file.name).join(', ');
        // Tu peux afficher un message ou mettre à jour ton UI ici
        console.log('Fichiers uploadés : ' + fileNames);
        // Optionnel : afficher une notification ou update du champ texte
    }
    

    /*successHandler(event) {
        this.showModalPopup = false;
        this.showToast('Data saved successfully');
       // refreshApex(this.reimbursementsWireResult);

        const refreshEvent = new CustomEvent('refreshreimbursements');
        this.dispatchEvent(refreshEvent);
    }*/
    submitHandler(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        fields.Status__c = 'Pending';
        fields.Contact__c = this.contactId; // 💡 injecte le contact lié
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }
    
   /* submitHandler(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        fields.Status__c = 'Pending';
        this.refs.leaveReqeustFrom.submit(fields);    
    }*/

    showToast(message, title = 'Success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
   
    
}