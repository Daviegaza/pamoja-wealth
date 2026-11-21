import { LegalLayout } from "./LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="November 2026">
      <section>
        <h2>1. What Pamoja Wealth is</h2>
        <p>
          Pamoja Wealth (&quot;the Service&quot;) is record-keeping software for chamas and similar savings or welfare groups. It lets a
          group record contributions, loans the group makes from its own funds, repayments, meetings and minutes, and produce
          statements and an audit log from those records.
        </p>
      </section>
      <section>
        <h2>2. We never hold or move your money</h2>
        <p>
          Pamoja Wealth does not receive, hold, transfer, invest or lend money on behalf of any chama or member. Members pay the
          chama directly through the chama&apos;s own M-Pesa Paybill/Till, bank account or other arrangement chosen by the chama.
          Pamoja Wealth is not a bank, SACCO, microfinance institution, payment service provider, digital credit provider,
          investment adviser or collective investment scheme.
        </p>
        <ul>
          <li>Records in the Service are entered by chama officers and confirmed or disputed by members. They are not proof that a payment was made — the chama&apos;s M-Pesa or bank statement is.</li>
          <li>Loans in the loan register are agreements between the chama and its members under the chama&apos;s own rules. Pamoja Wealth is not a party to them and does not set or charge interest.</li>
        </ul>
      </section>
      <section>
        <h2>3. Accounts and roles</h2>
        <p>
          You must give accurate details and keep your password secret. Each chama decides who holds the chairperson, treasurer
          and secretary roles. Officers are responsible for the accuracy of the records they enter and for following their
          chama&apos;s constitution and applicable law.
        </p>
      </section>
      <section>
        <h2>4. Subscription fees</h2>
        <p>
          Some plans carry a subscription fee per chama, shown on the Pricing page. Fees are paid through our payment processors
          (Flutterwave or Paystack) and a plan is activated only after the processor confirms the payment. Fees are for use of the
          software only; we charge no fee on contributions, loans or repayments.
        </p>
      </section>
      <section>
        <h2>5. Acceptable use</h2>
        <p>
          Do not use the Service for unlawful purposes, to record fictitious transactions, to access another chama&apos;s records
          without permission, or to interfere with the Service&apos;s security.
        </p>
      </section>
      <section>
        <h2>6. Your data</h2>
        <p>
          Chama records belong to the chama. You can export them at any time. How we handle personal data is described in our
          Privacy Notice.
        </p>
      </section>
      <section>
        <h2>7. Liability</h2>
        <p>
          The Service is provided as-is. To the extent permitted by law, Pamoja Wealth is not liable for losses arising from
          inaccurate records entered by users, from disputes between members and their chama, or from money movements that happen
          outside the Service.
        </p>
      </section>
      <section>
        <h2>8. Governing law</h2>
        <p>These terms are governed by the laws of Kenya.</p>
      </section>
    </LegalLayout>
  );
}
