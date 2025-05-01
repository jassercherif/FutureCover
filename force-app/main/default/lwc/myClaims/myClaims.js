import { LightningElement, wire } from 'lwc';
import getMyClaims from '@salesforce/apex/ClaimController.getMyClaims';

export default class MyClaims extends LightningElement {
    claims;
    error;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Subject', fieldName: 'Subject__c' },
        {
            label: 'Status',
            fieldName: 'Status__c',
            cellAttributes: {
                class: { fieldName: 'statusClass' },
                iconName: { fieldName: 'statusIcon' },
                iconPosition: 'left'
            }
        },
        { label: 'Details', fieldName: 'Details__c' }
    ];

    @wire(getMyClaims)
    wiredClaims({ error, data }) {
        if (data) {
            this.claims = data.map(row => ({
                ...row,
                statusClass: this.getStatusClass(row.Status__c),
                statusIcon: this.getStatusIcon(row.Status__c)
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.claims = undefined;
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Treated':
                return 'slds-text-color_success';
            case 'In Review':
                return 'yellow-status';
            default:
                return '';
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'Treated':
                return 'utility:check';
            /*case 'Untreated':
                return 'utility:close';*/
            case 'In Review':
                return 'utility:sync';
            default:
                return 'utility:question';
        }
    }
}
