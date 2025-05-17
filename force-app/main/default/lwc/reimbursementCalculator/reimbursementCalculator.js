import { LightningElement } from 'lwc';

export default class ReimbursementCalculator extends LightningElement {
    submittedAmount = 0;
    baseAmount = 0;
    rate = 0;
    coverageLimit = 0;
    errorMessage = '';

    get reimbursedAmount() {
        this.errorMessage = '';

        if (this.submittedAmount <= this.baseAmount) {
            this.errorMessage = 'Submitted amount must be greater than the base amount.';
            return 0;
        }

        let calculated = (this.submittedAmount - this.baseAmount) * (this.rate / 100);

        if (calculated > this.coverageLimit) {
            this.errorMessage = `Reimbursed amount exceeds the coverage limit of ${this.coverageLimit} TND. It has been capped.`;
            calculated = this.coverageLimit;
        }

        return calculated;
    }

    handleSubmittedChange(event) {
        this.submittedAmount = parseFloat(event.target.value) || 0;
    }

    handleBaseChange(event) {
        this.baseAmount = parseFloat(event.target.value) || 0;
    }

    handleRateChange(event) {
        this.rate = parseFloat(event.target.value) || 0;
    }

    handleLimitChange(event) {
        this.coverageLimit = parseFloat(event.target.value) || 0;
    }
}
