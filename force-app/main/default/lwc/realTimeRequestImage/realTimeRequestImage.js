import { LightningElement } from 'lwc';
import RealTimeRequest from '@salesforce/resourceUrl/RealTimeRequest'; // Importation de l'image depuis Static Resources

export default class RealTimeRequestImage extends LightningElement {
    imageUrl = RealTimeRequest;  // URL de la ressource statique
}
