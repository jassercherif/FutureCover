import { LightningElement } from 'lwc';
import InsuranceImage1 from '@salesforce/resourceUrl/InsuranceImage1'; // Importation de l'image depuis Static Resources

export default class ImageDisplay1 extends LightningElement {
    imageUrl = InsuranceImage1;  // Utilisation de l'URL de l'image
}
