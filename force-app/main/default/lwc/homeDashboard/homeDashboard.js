import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
 
export default class HomeDashboard extends NavigationMixin(LightningElement) {
    stat() {
        // Incrémentez le nombre d'opportunités modifiées
   
        window.location.href = '/lightning/n/Jobs_Dashbords';//ouverture dans la meme fenetre
   }

   handleClickDashboardLeads(){
    this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
            url: 'https://ensi4-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZQy000003KpizMAC/view?queryScope=userFolders'
        }
    });

    }

    handleClickDashboardOpportuinities(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://ensi4-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZQy000003Ku5xMAC/view?queryScope=userFolders'
            }
        });
 
    }

    handleClickDashboardClaims(){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url:  'https://ensi4-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZQy000003KzdVMAS/view?queryScope=userFolders'
            }
        });
 
    }
}