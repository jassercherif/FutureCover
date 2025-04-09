import { LightningElement, wire, track } from 'lwc';
import uploadFileToOpportunity from '@salesforce/apex/OpportunityController.uploadFileToOpportunity';
import getOpportunityStatusWithContactInfo from '@salesforce/apex/OpportunityController.getOpportunityStatusWithContactInfo';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class UploadEmployees extends LightningElement {
    @track fileData;
    @track fileName = '';
    @track error;
    @track success = false;

    @track currentStep = '1';
    @track contactName;
    opportunityStatus;

    get disableSend() {
        return !this.fileData;
    }

    @wire(getOpportunityStatusWithContactInfo)
    wiredOpportunityStatus({ error, data }) {
        if (data) {
            console.log('Données récupérées:', JSON.stringify(data));
            this.opportunityStatus = data;
            this.contactName = data.ContactName;

            const opportunityStageName = data.StageName;
        } else if (error) {
            this.error = error;
            console.error('Erreur lors de la récupération du statut de l\'opportunité:', error);
            this.opportunityStatus = undefined;
        }
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.error = 'File size must be less than 5MB';
                this.fileData = null;
                this.fileName = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                this.fileData = {
                    filename: file.name,
                    base64: base64,
                    fileType: file.type
                };
                this.fileName = file.name;
                this.error = null;
                this.success = false;
            };
            reader.readAsDataURL(file);
        }
    }

    handleSendFile() {
        if (!this.fileData) {
            this.error = 'No file selected';
            return;
        }

        if (!this.opportunityStatus || !this.opportunityStatus.Id) {
            this.error = 'Unable to retrieve opportunity ID.';
            return;
        }

        uploadFileToOpportunity({
            opportunityId: this.opportunityStatus.Id,
            base64Data: this.fileData.base64,
            fileName: this.fileData.filename
        })
            .then(() => {
                this.success = true;
                this.error = null;
                this.fileData = null;
                this.fileName = '';
                this.showToast('Success', 'File uploaded successfully!', 'success');
            })
            .catch(error => {
                this.success = false;
                this.error = this.reduceError(error);
                this.showToast('Error', this.error, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    reduceError(error) {
        if (error && error.body) {
            if (Array.isArray(error.body)) {
                return error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                return error.body.message;
            }
        }
        return error.toString();
    }
}
