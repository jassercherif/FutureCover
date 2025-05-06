import { LightningElement } from 'lwc';
import SecurityProtection from '@salesforce/resourceUrl/SecurityProtection'; // Importation de l'image depuis Static Resources

export default class SecurityProtectionImage extends LightningElement {
    imageUrl = SecurityProtection;  // Utilisation de l'URL de l'image
}
