public without sharing class LeadWebHookCaller {
    @future(callout=true)
    public static void callFlaskWebhook() {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://b857-197-21-22-86.ngrok-free.app/webhook'); // Remplace par ton URL publique Flask
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody('{}'); // Corps vide

        try {
            HttpResponse res = http.send(req);
            System.debug('📡 Webhook appelé, réponse : ' + res.getBody());
        } catch (Exception e) {
            System.debug('❌ Erreur webhook Flask : ' + e.getMessage());
        }
    }
}

