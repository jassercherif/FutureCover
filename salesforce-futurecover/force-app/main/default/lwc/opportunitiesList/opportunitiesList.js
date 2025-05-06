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
    @track selectedStage = '';
    currentPage = 1;
    recordSize = 7;
    totalPage = 0;
    @track filteredDataLength = 0;
@track filteredData = [];
get stageOptions() {
    return [
        { label: 'All Stages', value: '' },
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
        { label: 'Contract Preparation', value: 'Contract Preparation' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];
}

handleStageChange(event) {
    this.selectedStage = event.detail.value;
    this.filterData(); // Re-filtrer les données
}
@track sortAscending = true;

handleSortProbability() {
    this.sortAscending = !this.sortAscending;
    this.sortDataByProbability();
}

sortDataByProbability() {
    if (this.visibleDatas) {
        this.visibleDatas = [...this.visibleDatas].sort((a, b) => {
            const valA = a.Probability || 0;
            const valB = b.Probability || 0;
            return this.sortAscending ? valA - valB : valB - valA;
        });
    }
}
/*filterData() {
    if (this.data) {
        this.visibleDatas = this.data.filter(opp => {
            const nameMatch = opp.Name?.toLowerCase().includes(this.searchKey.toLowerCase());
            const stageMatch = this.selectedStage ? opp.StageName === this.selectedStage : true;
            return nameMatch && stageMatch;
        });

        this.sortDataByProbability(); // Tri après filtrage
    }
}*/
nextPage() {
    if (this.currentPage < this.totalPage) {
        this.currentPage++;
        this.filterData();
    }
}

previousPage() {
    if (this.currentPage > 1) {
        this.currentPage--;
        this.filterData();
    }
}
get disablePrevious() {
    return this.currentPage <= 1;
}

get disableNext() {
    return this.currentPage >= this.totalPage;
}


filterData() {
    if (this.data) {
        // Filtrer les données
        this.filteredData = this.data.filter(opp => {
            const nameMatch = opp.Name?.toLowerCase().includes(this.searchKey.toLowerCase());
            const stageMatch = this.selectedStage ? opp.StageName === this.selectedStage : true;
            return nameMatch && stageMatch;
        });

        // Mettre à jour les informations de pagination
        this.filteredDataLength = this.filteredData.length;
        this.totalPage = Math.ceil(this.filteredDataLength / this.recordSize);
        
        // Découper les données pour la page courante
        const startIndex = (this.currentPage - 1) * this.recordSize;
        const endIndex = startIndex + this.recordSize;
        this.visibleDatas = this.filteredData.slice(startIndex, endIndex);
        
        // Appliquer le tri
        this.sortDataByProbability();
    }
}



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
    }
    

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        this.filterData();
    }

    /*filterData() {
        if (this.data) {
            this.visibleDatas = this.data.filter(opp =>
                opp.Name?.toLowerCase().includes(this.searchKey.toLowerCase())
            );
        }
    }*/

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
