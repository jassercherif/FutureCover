import { LightningElement } from 'lwc';
import SatisfactionFeedbackI from '@salesforce/resourceUrl/SatisfactionFeedbackI'; // Importation de l'image depuis Static Resources

export default class SatisfactionFeedback extends LightningElement {
    imageUrl = SatisfactionFeedbackI;  // URL de la ressource statique
}
