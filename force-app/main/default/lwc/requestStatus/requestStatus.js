import { LightningElement, track } from 'lwc';

export default class StepWizard extends LightningElement {
    @track currentStep = 2;  // L'étape active par défaut est 2 (Besoins)

    // Méthode qui génère les classes dynamiques pour chaque étape
    stepClass(step) {
        return this.currentStep === step ? 'step-wizard-item current-item' : 'step-wizard-item';
    }

    // Méthode pour changer d'étape
    changeStep(stepNumber) {
        this.currentStep = stepNumber;
    }

    // Méthodes pour tester chaque étape
    handleStepOne() {
        this.changeStep(1);
    }

    handleStepTwo() {
        this.changeStep(2);
    }

    handleStepThree() {
        this.changeStep(3);
    }

    handleStepFour() {
        this.changeStep(4);
    }
}
