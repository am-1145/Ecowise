import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Users, Award, QrCode, PlusCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export const Community: React.FC = () => {
  const { challenges, token, user, fetchChallenges, fetchProfile } = useStore();
  const { speak } = useAccessibility();

  // Tab selections
  const [activeTab, setActiveTab] = useState<'challenges' | 'teams'>('challenges');

  // QR Scanning States
  const [showQrScan, setShowQrScan] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Teams States
  const [teamName, setTeamName] = useState('');
  const [teamType, setTeamType] = useState<'family' | 'team'>('team');
  const [inviteCode, setInviteCode] = useState('');
  const [joinedTeam, setJoinedTeam] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);


  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
    if (user?.teamId || user?.familyId) {
      fetchMyTeamDetails();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data.teams);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTeamDetails = async () => {
    try {
      const id = user.teamId || user.familyId;
      const res = await axios.get(`${API_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJoinedTeam(res.data.team);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await axios.post(`${API_URL}/gamification/challenges/join`, {
        challengeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      speak('Successfully joined challenge! Complete rules and scan the QR code to finish.');
      await fetchChallenges();
      await fetchProfile();
    } catch (err: any) {
      speak(err.response?.data?.error || 'Failed to join challenge.');
    }
  };

  const handleQrCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;

    try {
      const res = await axios.post(`${API_URL}/gamification/challenges/checkin`, {
        qrCodeData: qrInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setScanMessage(res.data.message);
      speak(res.data.message);
      setQrInput('');
      setShowQrScan(false);

      await fetchChallenges();
      await fetchProfile();
    } catch (err: any) {
      setScanMessage(err.response?.data?.error || 'Invalid challenge QR code.');
      speak(err.response?.data?.error || 'Invalid challenge QR code.');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    try {
      const res = await axios.post(`${API_URL}/teams`, {
        name: teamName,
        type: teamType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      speak(`Successfully created group ${teamName}! Share the invite code ${res.data.team.inviteCode} with your colleagues.`);
      setTeamName('');
      await fetchProfile();
      await fetchLeaderboard();
    } catch (err: any) {
      speak(err.response?.data?.error || 'Failed to create group.');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;

    try {
      await axios.post(`${API_URL}/teams/join`, {
        inviteCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      speak('Successfully joined the group!');
      setInviteCode('');
      await fetchProfile();
      await fetchLeaderboard();
    } catch (err: any) {
      speak(err.response?.data?.error || 'Failed to join group.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">EcoWise Community Hub</h1>
          <p className="text-muted-foreground mt-1">Enroll in green challenges, QR check-in, and compete in family groups.</p>
        </div>
        <button
          onClick={() => {
            setShowQrScan(!showQrScan);
            speak(showQrScan ? 'Closing scanner.' : 'Opening QR code scanner mock.');
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white py-2.5 px-5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-primary/20 text-sm"
        >
          <QrCode className="h-4.5 w-4.5" />
          Scan Challenge QR
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 border-b pb-3 border-border">
        <button
          onClick={() => {
            setActiveTab('challenges');
            speak('Showing active challenges catalog.');
          }}
          className={`text-sm py-2 px-4 rounded-xl font-bold border transition-all duration-200 ${
            activeTab === 'challenges'
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          🏆 Community Challenges
        </button>
        <button
          onClick={() => {
            setActiveTab('teams');
            speak('Showing competitive teams and family profiles.');
          }}
          className={`text-sm py-2 px-4 rounded-xl font-bold border transition-all duration-200 ${
            activeTab === 'teams'
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          👥 Groups &amp; Families
        </button>
      </div>

      {scanMessage && (
        <div className="bg-primary/10 border border-primary text-primary p-4 rounded-2xl text-sm font-semibold shadow-sm animate-bounce text-center">
          {scanMessage}
        </div>
      )}

      {/* QR Code Scanner Overlay */}
      {showQrScan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleQrCheckIn} className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 glass-card animate-in zoom-in duration-300">
            <h3 className="font-bold text-lg">Scan Challenge Event QR Code</h3>
            <p className="text-xs text-muted-foreground">
              Complete your ecological actions (like taking the bus or swapping diet portions) then scan the event QR code to check in.
            </p>

            <div>
              <label htmlFor="qr-code-data" className="text-xs font-semibold block mb-1">Enter QR Payload Data</label>
              <input
                id="qr-code-data"
                type="text"
                required
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
                placeholder="e.g. QR_CHALLENGE_MEAT_FREE"
              />
              <span className="text-[10px] text-muted-foreground mt-1.5 block">
                Tip: Copy paste any challenge's QR code code (e.g. <strong>QR_CHALLENGE_MEAT_FREE</strong>, <strong>QR_CHALLENGE_TRANSIT_STREAK</strong>, <strong>QR_CHALLENGE_ZERO_PLASTIC</strong>) to test check-in!
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQrScan(false)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10"
              >
                Simulate Scan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid content panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main content panels */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'challenges' ? (
            <div className="space-y-4">
              {challenges.map((c) => {
                const enrolled = user?.challengeRegistrations?.some(
                  (reg: any) => reg.challengeId.toString() === c._id.toString()
                );
                const completed = user?.challengeRegistrations?.some(
                  (reg: any) => reg.challengeId.toString() === c._id.toString() && reg.completedAt
                );

                return (
                  <div key={c._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base">{c.title}</h3>
                          {completed && (
                            <span className="bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] py-0.5 px-2 rounded-full uppercase">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <span className="text-xs font-bold bg-secondary py-1 px-3 border border-border rounded-lg text-foreground shrink-0">
                        🏆 +{c.pointsReward} Points
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-t border-b text-center text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Active Members</span>
                        <span className="font-bold">{c.participantsCount} Warriors</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Duration</span>
                        <span className="font-bold">{c.durationDays} Days</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Rewards</span>
                        <span className="font-bold text-primary">+{c.xpReward} XP</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Badge Reward: <strong className="text-foreground">{c.badgeReward}</strong>
                      </span>
                      {completed ? (
                        <div className="text-primary font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Earned
                        </div>
                      ) : enrolled ? (
                        <button
                          onClick={() => {
                            setQrInput(c.qrCodeData);
                            setShowQrScan(true);
                            speak(`Enrolled. QR Code filled. Click Simulate Scan.`);
                          }}
                          className="bg-primary text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md hover:bg-primary/95 transition-all duration-200"
                        >
                          Check In Now
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinChallenge(c._id)}
                          className="bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs py-2 px-4 rounded-xl transition-all duration-200"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Joined group details */}
              {joinedTeam ? (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-extrabold text-lg flex items-center gap-2">
                        <Users className="text-primary h-5 w-5" />
                        {joinedTeam.name}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">Group Category: {joinedTeam.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Invite Code</span>
                      <span className="font-mono font-bold text-primary text-sm bg-primary/10 border border-primary/20 py-0.5 px-2 rounded">
                        {joinedTeam.inviteCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center text-xs">
                    <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                      <span className="text-muted-foreground block uppercase font-semibold mb-1">Total Points Pooled</span>
                      <span className="text-lg font-bold text-primary">{joinedTeam.totalPoints}</span>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                      <span className="text-muted-foreground block uppercase font-semibold mb-1">Carbon Offsets Pooled</span>
                      <span className="text-lg font-bold text-foreground">{joinedTeam.totalCarbonSaved} kg</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-bold text-sm">Group Members</h4>
                    <div className="divide-y divide-border">
                      {joinedTeam.members?.map((mem: any, idx: number) => (
                        <div key={idx} className="py-2 flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">{mem.userId?.name || 'Group Member'}</span>
                          <span className="text-muted-foreground">Points: <strong className="text-primary">{mem.userId?.points || 0}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Create group card */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <PlusCircle className="text-primary h-5 w-5" />
                      Create Family or Team
                    </h3>
                    <form onSubmit={handleCreateTeam} className="space-y-3.5">
                      <div>
                        <label htmlFor="team-name" className="text-xs font-semibold block mb-1">Group Name</label>
                        <input
                          id="team-name"
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Green Pioneers"
                        />
                      </div>
                      <div>
                        <label htmlFor="team-type-select" className="text-xs font-semibold block mb-1">Group Category</label>
                        <select
                          id="team-type-select"
                          value={teamType}
                          onChange={(e) => setTeamType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="team">Team / Corporate Group</option>
                          <option value="family">Family Unit</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        Create Group
                      </button>
                    </form>
                  </div>

                  {/* Join group card */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Users className="text-primary h-5 w-5" />
                      Join via Invite Code
                    </h3>
                    <form onSubmit={handleJoinTeam} className="space-y-3.5">
                      <div>
                        <label htmlFor="invite-input" className="text-xs font-semibold block mb-1">Invite Code</label>
                        <input
                          id="invite-input"
                          type="text"
                          required
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center uppercase"
                          placeholder="e.g. XF23RE"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground py-2 rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        Join Group
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Competitive Team Leaderboard sidebar */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="text-primary h-5 w-5" />
            Competitive Rankings
          </h3>

          <div className="divide-y divide-border">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground">No groups established yet.</p>
            ) : (
              leaderboard.map((team, idx) => (
                <div key={team._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-extrabold text-muted-foreground w-4">{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{team.name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{team.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary block">{team.totalPoints} pts</span>
                    <span className="text-[9px] text-muted-foreground">{team.totalCarbonSaved} kg saved</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
