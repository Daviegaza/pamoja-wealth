import { LegalLayout } from "./LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Notice" updated="November 2026">
      <section>
        <h2>1. Who is responsible for your data</h2>
        <p>
          We handle personal data in line with Kenya&apos;s Data Protection Act, 2019. For the records a chama keeps about its
          members (contributions, loans, meeting minutes), the chama — acting through its officers — is the <strong>data
          controller</strong>, and Pamoja Wealth processes that data on the chama&apos;s behalf as a <strong>data processor</strong>.
          For your account itself (login, contact details, subscription billing), Pamoja Wealth is the data controller.
        </p>
      </section>
      <section>
        <h2>2. What we collect</h2>
        <ul>
          <li>Account details: name, email address, phone number, password (stored hashed).</li>
          <li>Chama records entered by officers: contribution amounts and dates, payment method, optional M-Pesa receipt codes, loan and repayment records, meeting details and minutes.</li>
          <li>Technical data needed to keep the Service secure, such as IP address and device information in audit logs.</li>
        </ul>
        <p>
          We never ask for or store M-Pesa PINs, bank passwords or card numbers. Subscription payments are processed by
          Flutterwave or Paystack, who handle card and mobile-money details directly.
        </p>
      </section>
      <section>
        <h2>3. How we use it</h2>
        <ul>
          <li>To provide the record-keeping features your chama uses.</li>
          <li>To send notifications you need, such as a request to confirm a contribution.</li>
          <li>To secure the Service, keep an audit log and prevent misuse.</li>
          <li>To bill your chama&apos;s subscription.</li>
        </ul>
        <p>We do not sell personal data and do not use it for advertising.</p>
      </section>
      <section>
        <h2>4. Who can see it</h2>
        <p>
          Within a chama, officers see the records and member contact details needed to run the chama; members see their own
          records and chama-wide summaries. We share data with service providers (hosting, email/SMS, payment processors) only as
          needed to run the Service, under contract.
        </p>
      </section>
      <section>
        <h2>5. Your rights</h2>
        <p>
          You may ask to access, correct or delete your personal data, or object to its processing. Requests about a chama&apos;s
          records should go to that chama&apos;s officers first; we will help them respond. Chama financial records may need to be
          kept for a period even after a member leaves, so the chama&apos;s books stay complete.
        </p>
      </section>
      <section>
        <h2>6. Retention and security</h2>
        <p>
          We keep data for as long as the chama&apos;s account is active and as required by law, then delete or anonymise it. Data
          is encrypted in transit, access is restricted by role, and every change to chama records is logged.
        </p>
      </section>
      <section>
        <h2>7. Contact</h2>
        <p>Questions or complaints can be sent through the Help page. You may also complain to the Office of the Data Protection Commissioner.</p>
      </section>
    </LegalLayout>
  );
}
