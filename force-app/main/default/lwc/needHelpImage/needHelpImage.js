import { LightningElement } from 'lwc';
import needHelp from '@salesforce/resourceUrl/needHelp'; // Importation de l'image depuis Static Resources

export default class NeedHelpImage extends LightningElement {
    imageUrl = needHelp;  // URL de la ressource statique
}
