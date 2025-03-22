import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ThankYouPage extends NavigationMixin(LightningElement) {
    handleReturnToHome() {
        // Redirection vers la page d'accueil de la communauté
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/' // l'URL de la page de remerciement
            }
        });
    }
}
