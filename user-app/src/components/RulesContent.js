import React from 'react';

export default function RulesContent() {
  return (
    <div className="space-y-6 text-sm text-esports-gray font-sans leading-relaxed">
      <p>
        Welcome to <strong className="text-ff-orange">ALPHA ACE ARENA</strong>. By participating in our tournaments, you agree to follow the rules below. Failure to comply may result in disqualification, suspension, or permanent account termination.
      </p>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">1. Eligibility</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Players must have a <strong>Free Fire account with a minimum level of 20</strong>.</li>
          <li>Players must have a <strong>Headshot Rate (HSR) of less than 75%</strong> at the time of registration. Organizers reserve the right to verify player statistics.</li>
          <li>Players must provide accurate account information during registration.</li>
          <li>Each player may use <strong>only one account</strong> unless otherwise permitted by the tournament organizers.</li>
          <li>Players must register using <strong>their own Free Fire UID</strong>.</li>
          <li>Organizers may reject or disqualify players who provide false information or fail to meet the eligibility requirements.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">2. Registration</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tournament registration is confirmed only after successful payment (if an entry fee applies).</li>
          <li>Players are responsible for entering the correct Free Fire UID and other required details.</li>
          <li>Incorrect information may result in disqualification without a refund.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">3. Match Timing</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Players must join the custom room before the scheduled start time.</li>
          <li>Late arrivals may not be allowed to participate.</li>
          <li>Room ID and password will be shared through the app before the match.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">4. Fair Play</h2>
        <p>The following actions are strictly prohibited:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Using hacks, cheats, scripts, or modified game files.</li>
          <li>Exploiting game bugs or glitches.</li>
          <li>Account sharing or impersonation.</li>
          <li>Match fixing or collusion with other players.</li>
          <li>Teaming in solo matches.</li>
          <li>Any unfair gameplay that provides an advantage over other players.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">5. Player Conduct</h2>
        <p>Players must:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Treat other players and organizers with respect.</li>
          <li>Avoid abusive, offensive, hateful, or discriminatory language.</li>
          <li>Follow the instructions provided by tournament administrators.</li>
          <li>Maintain good sportsmanship throughout the tournament.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">6. Disqualification</h2>
        <p>Players may be disqualified for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Violating any tournament rule.</li>
          <li>Providing false information.</li>
          <li>Using unauthorized software or unfair methods.</li>
          <li>Failing to join the match on time.</li>
          <li>Engaging in toxic or disruptive behavior.</li>
        </ul>
        <p className="text-ff-error-text mt-2 font-bold">Disqualified players may forfeit entry fees, prizes, and future participation rights.</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">7. Prize Distribution</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Prize amounts are announced before the tournament begins.</li>
          <li>Winners will receive prizes only after result verification.</li>
          <li>Organizers may request additional verification before processing prize payouts.</li>
          <li>Prize processing times may vary.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">8. Refund Policy</h2>
        <p>Entry fees are generally non-refundable.</p>
        <p>Refunds may be considered only if:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The tournament is canceled by the organizer.</li>
          <li>A verified duplicate payment occurs.</li>
          <li>A platform-related technical issue prevents participation.</li>
        </ul>
        <p className="font-bold text-ff-text mt-2">No refunds will be issued for late arrivals, incorrect UID submissions, voluntary withdrawals, or rule violations.</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">9. Tournament Changes</h2>
        <p>ALPHA ACE ARENA reserves the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Modify match schedules.</li>
          <li>Change tournament formats.</li>
          <li>Cancel or postpone tournaments due to technical issues, insufficient participants, or unforeseen circumstances.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">10. Organizer Decisions</h2>
        <p>All decisions made by tournament administrators regarding gameplay, disputes, eligibility, and prize distribution are final.</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">11. Independent Platform Disclaimer</h2>
        <p>ALPHA ACE ARENA is an independent esports tournament platform. We are <strong>not affiliated with, endorsed by, sponsored by, or officially associated with Garena or Free Fire</strong>. All trademarks, logos, and game-related assets belong to their respective owners.</p>
      </div>

      <div className="space-y-2 border-t border-ff-border pt-4">
        <h2 className="text-lg font-bold text-ff-text font-heading tracking-widest uppercase">12. Contact Us</h2>
        <p>For questions, support, or tournament-related assistance, please contact us:</p>
        <p className="mt-1">
          <strong className="text-ff-orange">Email:</strong> <a href="mailto:alpha.ace.support@gmail.com" className="text-neon-blue hover:underline">alpha.ace.support@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
