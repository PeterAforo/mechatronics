import { emailTemplates } from '@/lib/email';

describe('Email Templates', () => {
  describe('passwordReset', () => {
    it('should generate password reset email', () => {
      const template = emailTemplates.passwordReset('https://example.com/reset', 'John');
      
      expect(template.subject).toBe('Reset Your Password - Mechatronics');
      expect(template.html).toContain('Reset Your Password');
      expect(template.html).toContain('https://example.com/reset');
      expect(template.html).toContain('John');
      expect(template.text).toContain('https://example.com/reset');
    });

    it('should work without name', () => {
      const template = emailTemplates.passwordReset('https://example.com/reset');
      
      expect(template.html).toContain('Reset Your Password');
      expect(template.html).not.toContain('undefined');
    });
  });

  describe('orderConfirmation', () => {
    it('should generate order confirmation email', () => {
      const items = [
        { name: 'Product 1', quantity: 2, price: 'GHS 100.00' },
        { name: 'Product 2', quantity: 1, price: 'GHS 50.00' },
      ];
      const template = emailTemplates.orderConfirmation('ORD-123', items, 'GHS 150.00', 'John');
      
      expect(template.subject).toContain('ORD-123');
      expect(template.html).toContain('Product 1');
      expect(template.html).toContain('Product 2');
      expect(template.html).toContain('GHS 150.00');
    });
  });

  describe('welcomeEmail', () => {
    it('should generate welcome email', () => {
      const template = emailTemplates.welcomeEmail('John', 'https://example.com/login');
      
      expect(template.subject).toContain('Welcome');
      expect(template.html).toContain('John');
      expect(template.html).toContain('https://example.com/login');
    });
  });

  describe('alertNotification', () => {
    it('should generate alert notification email', () => {
      // Parameters: alertTitle, alertMessage, deviceName, severity, dashboardUrl
      const template = emailTemplates.alertNotification(
        'High Temperature Alert',
        'Temperature exceeded threshold',
        'Device-001',
        'critical',
        'https://example.com/alerts'
      );
      
      expect(template.subject).toContain('High Temperature Alert');
      expect(template.html).toContain('Temperature exceeded threshold');
      expect(template.html).toContain('Device-001');
    });
  });

  describe('teamInvitation', () => {
    it('should generate team invitation email', () => {
      const template = emailTemplates.teamInvitation(
        'Acme Corp',
        'John Doe',
        'https://example.com/invite/abc123'
      );
      
      expect(template.subject).toContain('Acme Corp');
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('Acme Corp');
      expect(template.html).toContain('https://example.com/invite/abc123');
      expect(template.text).toContain('John Doe');
    });
  });

  describe('newsletterWelcome', () => {
    it('should generate newsletter welcome email', () => {
      const template = emailTemplates.newsletterWelcome(
        'user@example.com',
        'https://example.com/unsubscribe'
      );
      
      expect(template.subject).toContain('Newsletter');
      expect(template.html).toContain('https://example.com/unsubscribe');
    });
  });
});
