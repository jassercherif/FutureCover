import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getContacts from '@salesforce/apex/ObjectsController.getContacts';
import searchContact from '@salesforce/apex/ObjectsController.searchContact';


const columns = [
    { label: 'Name', fieldName: 'Name' },
    //{
   //     label: 'Company',
  //      fieldName: 'accountName'
  //  },
    { label: 'Phone', fieldName: 'Phone' },
    { label: 'Email', fieldName: 'Email' },
    { label: 'Title', fieldName: 'Title' },
    {
        type: 'button-icon',
        fixedWidth: 50,
        typeAttributes: {
            iconName: 'utility:preview',
            name: 'View',
            alternativeText: 'View',
            title: 'View',
            variant: 'bare',
            class:"slds-icon-text-link"
        }
    },
    {
        type: 'button-icon',
        fixedWidth: 50,
        typeAttributes: {
            iconName: 'utility:edit',
            name: 'Edit',
            alternativeText: 'Edit',
            title: 'Edit',
            variant: 'bare',
            class:"slds-icon-text-success"
        }
    },
    {
        type: 'button-icon',
        fixedWidth: 50,
        typeAttributes: {
            iconName: 'utility:delete',
            name: 'Delete',
            alternativeText: 'Delete',
            title: 'Delete',
            variant: 'bare',
            class: 'slds-icon-text-error'
        }
    }
];

export default class ContactList extends NavigationMixin(LightningElement) {
    @track data;
    @track wireResult;
    @track error;
    columns = columns;
    visibleDatas;
    allDatas;
    @track searchKey = '';
    currentPage = 1;
    recordSize = 7;
    totalPage = 0;

    
   
    @wire(getContacts)
    wiredContacts(result) {
        this.wireResult = result;
        if (result.data) {
            const rawData = result.data;
            this.data = rawData.map(contact => {
                console.log('CONTACT:', JSON.stringify(contact));
            return {
                ...contact,
                accountName: contact.Account && contact.Account.Name ? contact.Account.Name : 'No Account'
            };
        });
           //this.filterData(); // Call filter method after data is loaded
        } else if (result.error) {
            this.error = result.error;
        }
    }

    callRowAction(event) {
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName === 'Edit') {
            this.handleAction(recId, 'edit');
        } else if (actionName === 'Delete') {
            this.handleDeleteRow(recId);
        } else if (actionName === 'View') {
            this.handleAction(recId, 'view');
        }
    }

    handleAction(recordId, mode) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Contact',
                actionName: mode
            }
        });
    }

    //Delete Action
    /*@track isModalOpen = false;

    handleDeleteRow(recordIdToDelete) {
        system.debug('aa');
        this.openModal(recordIdToDelete);
    }
    

    handleDelete() {
        deleteRecord(this.recordIdToDelete)
            .then(result => {
                this.showToast('Success', 'Record deleted successfully!', 'success', 'dismissable');
                this.closeModal();
                return refreshApex(this.wireResult);
            }).catch(error => {
                this.error = error;
                this.closeModal();
            });
    }

    openModal() {
        this.isModalOpen = true;
    }
    
    closeModal() {
        this.isModalOpen = false;
    }*/
    handleDeleteRow(recordIdToDelete) {
        if (confirm('Are you sure you want to delete this contact?')) {
            deleteRecord(recordIdToDelete)
                .then(result => {
                    this.showToast('Success', 'Record deleted successfully!', 'success', 'dismissable');
                    return refreshApex(this.wireResult);
                }).catch(error => {
                    this.error = error;
                });
        }
    }

 
    updateContactHandler(event){
        this.visibleDatas=[...event.detail.records];
        console.log(event.detail.records);
    }

    //Create new Lead
    handleCreateRecord() {
        // Navigate to the record creation page for the desired object
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'
            }
        });
    }

    //Search
    @wire(searchContact, { searchKey: '$searchKey' })
    leadsearch(result) {
        if (result.data) {
            this.allDatas = result.data;
            this.totalPage = Math.ceil(this.allDatas.length / this.recordSize);
            this.updateVisibleData();
        } else if (result.error) {
            this.allDatas = [];
            this.visibleDatas = undefined;
        }
    }
 
    updateVisibleData() {
        const start = (this.currentPage - 1) * this.recordSize;
        const end = start + this.recordSize;
        this.visibleDatas = this.allDatas.slice(start, end);
    }
 
    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updateVisibleData();
        }
    }
 
    handleNextPage() {
        if (this.currentPage < this.totalPage) {
            this.currentPage += 1;
            this.updateVisibleData();
        }
    }
 
    get disablePrevious() {
        return this.currentPage <= 1;
    }
 
    get disableNext() {
        return this.currentPage >= this.totalPage;
    }
 
    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
    }

    /*handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        // Call a method to filter data based on the search key
        this.filterData();
    }
    filterData() {
        if (this.data) {
            this.visibleDatas = this.data.filter(lead =>
                lead.Name.toLowerCase().includes(this.searchKey.toLowerCase())
            );
        }
    }*/

    /* handleDownloadCSV() est une méthode appelée pour télécharger les données de la liste au format CSV. */
    handleDownloadCSV() {
        const csvData = this.data.map(lead => ({
            'Contact Name': lead.Name,
            'Phone': lead.Phone,
            'Email': lead.Email
        }));
 
        exportCSV(this.columns, csvData, 'ContactList');
    }

    /* downloadCSV() est une méthode asynchrone utilisée pour générer et télécharger le fichier CSV. */
    async downloadCSV() {
        const data = this.data;
        if (!data || data.length === 0) {
            this.showToast('Error', 'No data to download', 'error');
            return;
        }
    
        const csvContent = this.convertArrayOfObjectsToCSV(data);
        this.downloadCSVFile(csvContent, 'ContactList.csv');
    }
    

    /* convertArrayOfObjectsToCSV(data) convertit les données des prospects en une chaîne CSV. */
    convertArrayOfObjectsToCSV(data) {
        const csvHeader = Object.keys(data[0]).join(',');
        const csvRows = data.map(row => Object.values(row).join(','));
        return csvHeader + '\n' + csvRows.join('\n');
    }

    /* downloadCSVFile(csvContent, fileName) télécharge le fichier CSV généré en utilisant l'élément <a> caché. */
    downloadCSVFile(csvContent, fileName) {
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        hiddenElement.setAttribute('download', fileName); // Use setAttribute to set the download attribute
        hiddenElement.style.display = 'none';
        document.body.appendChild(hiddenElement);
        hiddenElement.click();
        document.body.removeChild(hiddenElement);
    }

    /* Dashboard redirection */
    handleClickDashboard(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://talan104-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZWU000000IQg52AG/view?queryScope=userFolders'
            }
        });
 
    }

    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }

}