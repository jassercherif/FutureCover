import { LightningElement, track, wire } from 'lwc';
import getOpportunity from '@salesforce/apex/OpportunityController.getOpportunity';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: 'Opportunity Name', fieldName: 'Name' },
    {
        label: 'Stage',
        fieldName: 'StageName',
        type: 'text',
        cellAttributes: {
            class: { fieldName: 'stageClass' }
        }
    },    
    { label: 'Probability', fieldName: 'Probability' },
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

export default class OpportunitiesList extends NavigationMixin(LightningElement) {
    @track data;
    @track wireResult;
    @track error;
    @track searchKey = '';
    visibleDatas;
    columns = columns;

    @wire(getOpportunity)
    wiredOpportunities(result) {
        this.wireResult = result;
        if (result.data) {
            this.data = this.addStageClass(result.data);
            this.filterData();
        } else if (result.error) {
            this.error = result.error;
        }
    }

    addStageClass(opps) {
        return opps.map(opp => {
            let cellClass = '';
            switch ((opp.StageName || '').toLowerCase()) {
                case 'prospecting':
                    cellClass = 'slds-text-color_default';
                    break;
                case 'qualification':
                    cellClass = ' slds-text-color_inverse slds-theme_info';
                    break;
                case 'proposal/price quote':
                    cellClass = 'slds-theme_inverse ';
                    break;
                case 'contract preparation':
                    cellClass = ' slds-text-color_inverse slds-theme_warning';
                    break;
                case 'closed won':
                    cellClass = 'slds-text-color_inverse slds-theme_success';
                    break;
                case 'closed lost':
                    cellClass = 'slds-text-color_inverse slds-theme_error';
                    break;
                default:
                    cellClass = 'slds-text-color_default';
            }
            
            return { ...opp, stageClass: cellClass };
        });
    }
    
    

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        this.filterData();
    }

    filterData() {
        if (this.data) {
            this.visibleDatas = this.data.filter(opp =>
                opp.Name?.toLowerCase().includes(this.searchKey.toLowerCase())
            );
        }
    }

    callRowAction(event) {
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName === 'Edit') {
            this.navigateToRecord(recId, 'edit');
        } else if (actionName === 'View') {
            this.navigateToRecord(recId, 'view');
        } else if (actionName === 'Delete') {
            this.deleteOpportunity(recId);
        }
    }

    navigateToRecord(recordId, actionName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId,
                objectApiName: 'Opportunity',
                actionName
            }
        });
    }

    deleteOpportunity(recordId) {
        if (confirm('Are you sure you want to delete this opportunity?')) {
            deleteRecord(recordId)
                .then(() => {
                    this.showToast('Success', 'Opportunity deleted', 'success');
                    return refreshApex(this.wireResult);
                })
                .catch(error => {
                    this.showToast('Error deleting record', error.body.message, 'error');
                });
        }
    }

    handleCreateRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            }
        });
    }

    handleClickDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://talan104-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZWU000000SdeL2AS/view?queryScope=userFolders'
            }
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    updateContactHandler(event) {
        this.visibleDatas = [...event.detail.records];
    }

    async downloadCSV() {
        if (!this.data?.length) {
            this.showToast('Error', 'No data to download', 'error');
            return;
        }

        const header = Object.keys(this.data[0]).join(',');
        const rows = this.data.map(row => Object.values(row).join(','));
        const csvContent = [header, ...rows].join('\n');

        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'OpportunitiesList.csv';
        document.body.appendChild(hiddenElement);
        hiddenElement.click();
        document.body.removeChild(hiddenElement);
    }
}
