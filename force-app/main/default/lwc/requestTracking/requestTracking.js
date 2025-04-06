import { LightningElement, track,wire } from 'lwc';
import getOpportunityStatusWithContactInfo from '@salesforce/apex/OpportunityController.getOpportunityStatusWithContactInfo';

export default class SuiviCommande extends LightningElement {
    @track currentStep = '1';
    @track contactName; 
    @track error;
    /*
    @wire(getOpportunityStatusWithContactInfo)
    wiredOpportunityStatus({ error, data }) {
        if (data) {
            if (data.length > 0) {
                this.opportunityStatus = data;
                const opportunityStageName  = this.opportunityStatus.StageName;
                this.contactName = this.opportunityStatus.ContactName;
                console.log('opportunityStageName', opportunityStageName)
                console.log('contactName', this.contactName)

                // Mapping des noms de scène aux numéros d'étape
                const stageToStepMap = {
                    'En Attente de Commande': '1',
                    'Proposal/Price Quote': '2',
                    'Negotiation/Review': '3',
                    'Contract Preparation': '4',
                    'Await Signature': '5',
                    'Closed Won': '6',
                    'Closed Lost': '6'
                };
 
                this.currentStep = stageToStepMap[opportunityStageName]; // Par défaut à l'étape 1 si le nom de scène n'est pas trouvé
                console.log('currentStep',this.currentStep)
            }
        } else if (error) {
            this.error = error;
            console.error('Erreur lors de la récupération du statut de l\'opportunité:', error);
            this.opportunityStatus = undefined;
        }
    }
    */

    @wire(getOpportunityStatusWithContactInfo)
    wiredOpportunityStatus({ error, data }) {
        if (data) {
            this.opportunityStatus = data;
            this.contactName = data.ContactName;
            const opportunityStageName = data.StageName;
            console.log('opportunityStageName ',opportunityStageName)

            const stageToStepMap = {
                'Prospecting':'1',
             'Qualification':'2', 
             'Needs Analysis':'3', 
           'Value Proposition':'4', 
            'Id. Decision Makers':'5', 
             'Perception Analysis':'6', 
             'Proposal/Price Quote':'7',
          'Negotiation/Review':'8', 
             'Closed Won':'9', 
             'Closed Lost':'9'
            };

            this.currentStep = stageToStepMap[opportunityStageName] || '1';
            console.log('this.currentStep ',this.currentStep);
        } else if (error) {
            this.error = error;
            console.error('Erreur lors de la récupération du statut de l\'opportunité:', error);
            this.opportunityStatus = undefined;
        }
    }

    get isStepOne() {
        return this.currentStep === '1';
    }
 
    get isStepTwo() {
        return this.currentStep === '2';
    }
    get isStepThree() {
        return this.currentStep === '3';
    }
 
    get isStepFour() {
        return this.currentStep === '4';
    }
 
    get isStepFive() {
        return this.currentStep === '5';
    }
 
    get isStepSixOrSeven() {
        return this.currentStep === '6';
    }
   
    handleNext() {
        const currentStepNumber = parseInt(this.currentStep, 10);
        if (currentStepNumber < 10) {
            this.currentStep = (currentStepNumber + 1).toString();
        }
    }
 
    
    get isClosedWon() {
        console.log('this.opportunityStatus.StageName ',this.opportunityStatus.StageName)
        return this.currentStep === '9' && this.opportunityStatus.StageName === 'Closed Won';
    }
 
    get isClosedLost() {
        return this.currentStep === '9' && this.opportunityStatus.StageName === 'Closed Lost';
    }

}