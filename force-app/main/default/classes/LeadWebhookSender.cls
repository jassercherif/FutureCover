public class LeadWebhookSender {

        @future (callout=true)
        public static void sendToWebhook(Id leadId, String leadName, String Needs) {
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://a624-197-30-201-163.ngrok-free.app/webhook');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
    
            Map<String, Object> payload = new Map<String, Object>{
                'LeadId' => leadId,
                'LeadName' => leadName,
                'Needs__c' => Needs
            };
            req.setBody(JSON.serialize(payload));
    
            try {
                HttpResponse res = http.send(req);
                System.debug('Webhook Response: ' + res.getBody());
            } catch (Exception e) {
                System.debug('Error sending webhook: ' + e.getMessage());
            }
        }
        
}
