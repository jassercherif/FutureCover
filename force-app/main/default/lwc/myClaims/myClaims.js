import { LightningElement, wire } from 'lwc';
import getMyClaims from '@salesforce/apex/ClaimController.getMyClaims';

export default class MyClaims extends LightningElement {
    claims;
    error;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Subject', fieldName: 'Subject__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Details', fieldName: 'Details__c', type: 'text' }
    ];

    @wire(getMyClaims)
    wiredClaims({ error, data }) {
        if (data) {
            this.claims = data;
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.claims = undefined;
        }
    }
}
