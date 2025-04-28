import { LightningElement,track } from 'lwc';
import createReimbursement  from '@salesforce/apex/ReimbursementsController.createReimbursement';  // Assurez-vous d'avoir un Apex controller configuré
import { NavigationMixin } from 'lightning/navigation';
//import uploadAttachment from '@salesforce/apex/ReimbursementsController.uploadAttachment';
import getCurrentUserContactId from '@salesforce/apex/ReimbursementsController.getCurrentUserContactId';
import uploadFileToContact from '@salesforce/apex/ReimbursementsController.uploadFileToContact';
import uploadFileToReimbursement from '@salesforce/apex/ReimbursementsController.uploadFileToReimbursement';
import uploadFileToLastReimbursement from '@salesforce/apex/ReimbursementsController.uploadFileToLastReimbursement';

export default class ReimbursementForm extends NavigationMixin(LightningElement) {
    reimbursement = {}; // Initialiser l'objet de remboursement vide
    errorMessages = {};
    uploadedFile;
    @track fileData;
    @track fileName = '';
    fileBody;
    contactId;
    reimbursementId;
    packOptions = [
        { label: 'Life Insurance', value: 'Life Insurance' },
        { label: 'Health Insurance', value: 'Health Insurance' },
        { label: 'Auto Insurance', value: 'Auto Insurance' },
        { label: 'Travel Insurance', value: 'Travel Insurance' }
    ];
    

    connectedCallback() {
        this.fetchContactId();
    }

    fetchContactId() {
        getCurrentUserContactId()
            .then(result => {
                // Ici, result est l'Id du contact
                this.contactId = result;
                console.log('Contact ID:', this.contactId);
            })
            .catch(error => {
                // Gérer l'erreur
                console.error('Erreur lors de la récupération de l\'ID du contact:', error);
            });
    }
    
    
    async handleSubmit() {
        try {
            this.errorMessages = {};  // Réinitialiser les messages d'erreur
            
            if (!this.reimbursement.Type__c) {
                this.errorMessages.Type__c = 'Type is required.';
            }
            if (!this.reimbursement.Pack__c) {
                this.errorMessages.Pack__c = 'Pack is required.';
            }
            if (!this.reimbursement.Date__c) {
                this.errorMessages.Date__c = 'Date is required.';
            }
            if (this.reimbursement.Amount__c && isNaN(this.reimbursement.Amount__c)) {
                this.errorMessages.Amount__c = 'Please enter a valid number for the Amount.';
            }
            if (new Date() > new Date(this.reimbursement.Date__c)) {
                this.errorMessages.Date__c = 'From date should not be less then Today'
            }
            // Si des erreurs existent, ne pas soumettre
            if (Object.keys(this.errorMessages).length > 0) {
                throw new Error('Please fill out all required fields correctly.');
            }
            console.log('Submitting reimbursement:', this.reimbursement);
            // Soumettre les données via Apex
            const resalt = await createReimbursement({
                    Name: this.reimbursement.Name,
                    reimbursementDate: this.reimbursement.Date__c,
                    amount: this.reimbursement.Amount__c,
                    pack: this.reimbursement.Pack__c,
                    description: this.reimbursement.Description__c,
                    //hasValidReceipt: this.reimbursement.Has_valid_receipt__c,
                    type: this.reimbursement.Type__c,
                    status: 'Pending',
            });
            //console.log('Created reimbursement ID:', this.reimbursement.Id);
            console.log('Reimbursement created successfully:', resalt.Id);
            this.reimbursementId = resalt;
            this.handleSendFile();
            
            // Rediriger vers la page de confirmation après la soumission
            this[NavigationMixin.Navigate]( {
                type: 'standard__webPage',
                attributes: {
                    url: '/my-reimbursements' // Remplacez par l'URL de votre page de confirmation
                }
            });
            //this.handleClick();
        } catch (error) {
            console.error(error); 
            this.error = error.message || 'Please make sure all required fields are filled in correctly.';
        }
    }
    handleSendFile() {
        if (!this.fileData) {
            this.error = 'No file selected';
            return;
        }
    
        if (!this.contactId) {
            this.error = 'Unable to retrieve Contact ID.';
            return;
        }
    
        // ⚡ Solution : convertir Proxy en objet simple
        const fileDataSimple = JSON.parse(JSON.stringify(this.fileData));
    
        console.log('Contact ID:', this.contactId);
        console.log('File data (simple object):', fileDataSimple);
    
        /*uploadFileToContact({
            contactId: this.contactId,
            base64Data: fileDataSimple.base64,
            fileName: fileDataSimple.filename
        })*/ 
            uploadFileToLastReimbursement({
                //reimbursementId: this.reimbursementId,
                base64Data: fileDataSimple.base64,
                fileName: fileDataSimple.filename
            })
        .then(() => {
            this.success = true;
            this.error = null;
            this.fileData = null;
            this.fileName = '';
            this.showToast('Success', 'File uploaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Upload error', error);
            console.error('Upload error 2', JSON.stringify(error, null, 2));
            this.success = false;
            if (error.body && error.body.message) {
                console.error('Error message:', error.body.message);
            }
            this.error = this.reduceError(error);
            this.showToast('Error', this.error, 'error');
        });
    }
    
        handleClick() {
            window.location.reload();
        }
        handleChange(event) {
            const field = event.target.dataset.id;
            const value = event.target.value;
            // Mettre à jour l'objet reimbursement en fonction des changements de champ
            this.reimbursement = { ...this.reimbursement, [field]: value }; 
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


    handleBack() {
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/my-reimbursements'
                }
            });
        } catch (err) {
            console.error('Navigation error: ', err);
        }
        
    }
    
}
