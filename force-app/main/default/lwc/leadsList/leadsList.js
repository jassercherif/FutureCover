import { LightningElement, track, wire } from 'lwc';
import getLeads from '@salesforce/apex/LeadController.getLeads';
import searchLead from '@salesforce/apex/LeadController.searchLead';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';


const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Company', fieldName: 'Company' },
    { label: 'Phone', fieldName: 'Phone' },
    { label: 'Email', fieldName: 'Email' },
    { label: 'Lead Status', fieldName: 'Status' },

    {
        type: "button", label: 'Actions', initialWidth: 120, typeAttributes: {
            label: 'Details',
            name: 'View',
            title: 'View',
            disabled: false,
            value: 'view',
            iconPosition: 'left',
            iconName:'utility:preview',
            variant:'Brand'
        }
    },
    {
        type: "button", label: '', initialWidth: 120, typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            disabled: false,
            value: 'edit',
            iconPosition: 'left',
            iconName:'utility:edit',
            variant:'Brand'
        }
    },
    {
        type: "button", label: '', initialWidth: 120, typeAttributes: {
            label: 'Delete',
            name: 'Delete',
            title: 'Delete',
            disabled: false,
            value: 'delete',
            iconPosition: 'left',
            iconName:'utility:delete',
            variant:'destructive'
        }
    }
];

export default class LeadsList extends NavigationMixin(LightningElement) {
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

    @wire(getLeads)
    wiredLeads(result) {
        this.wireResult = result;
        if (result.data) {
            this.data = result.data;
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
                objectApiName: 'Lead',
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
        if (confirm('Are you sure you want to delete this lead?')) {
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
                objectApiName: 'Lead',
                actionName: 'new'
            }
        });
    }

    //Search
    @wire(searchLead, { searchKey: '$searchKey' })
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
            'Lead Name': lead.Name,
            'Phone': lead.Phone,
            'Email': lead.Email
        }));
 
        exportCSV(this.columns, csvData, 'LeadList');
    }

    /* downloadCSV() est une méthode asynchrone utilisée pour générer et télécharger le fichier CSV. */
    async downloadCSV() {
        const data = this.data;
        if (!data || data.length === 0) {
            this.showToast('Error', 'No data to download', 'error');
            return;
        }
    
        const csvContent = this.convertArrayOfObjectsToCSV(data);
        this.downloadCSVFile(csvContent, 'LeadsList.csv');
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