// Campus ERP prototype: app state + logic, then a tiny renderer.

// Minimal stand-in for the design tool's DCLogic base class.
class DCLogic {
  constructor() { this.props = {}; this.state = null; }
  setState(patch) { this.state = Object.assign({}, this.state, patch); schedule(); }
}

class Component extends DCLogic {
  st() {
    if (!this._init) {
      const rolls = [];
      for (let i = 1; i <= 16; i++) rolls.push('25A51A05' + String(i).padStart(2, '0'));
      const marks = {};
      ['27', '24', '29', '18', '26', '22', '28', '25'].forEach((m, i) => { marks[rolls[i]] = m; });
      this._init = {
        screen: 'login', role: 'student', loginId: '', loginErr: false,
        sSec: 'home', acadTab: 'attendance', examTab: 'mid1', feeTab: 'pay', marksTab: 'internal',
        tSec: 'home',
        rolls: rolls,
        notices: [
          { id: 6, date: '26/09/2026', no: '26-27/014', msg: 'II B.Tech I Sem Mid-I examinations begin 13 Oct 2026. The timetable is under Exam Time Tables.', by: 'Examination Branch' },
          { id: 5, date: '22/09/2026', no: '26-27/013', msg: 'Last date to pay Term 2 fees without fine is 10 Oct 2026.', by: 'Accounts Section' },
          { id: 4, date: '18/09/2026', no: '26-27/012', msg: 'Guest lecture on cloud-native systems in Seminar Hall 2 on 24 Sep 2026 at 10:00 AM.', by: 'Dept. of CSE' },
          { id: 3, date: '12/09/2026', no: '26-27/011', msg: 'Revaluation results for I B.Tech II Sem (Regular) have been published.', by: 'Examination Branch' },
          { id: 2, date: '05/09/2026', no: '26-27/010', msg: 'Supplementary examination hall tickets are available under Downloads.', by: 'Examination Branch' },
          { id: 1, date: '01/09/2026', no: '26-27/009', msg: 'Class work for II, III and IV B.Tech I Semester commences on 01 Sep 2026.', by: 'Academic Office' }
        ],
        assignments: [
          { id: 3, title: 'Implement a stack and a queue using linked lists', subject: 'Data Structures', cls: 'II CSE-A', due: '2026-10-03', status: 'Pending', base: 41 },
          { id: 2, title: 'K-map simplification, problem set 2', subject: 'Digital Logic Design', cls: 'II CSE-A', due: '2026-09-30', status: 'Submitted', base: 54 },
          { id: 1, title: 'Inheritance and interfaces case study', subject: 'OOP through Java', cls: 'II CSE-A', due: '2026-10-08', status: 'Pending', base: 12 }
        ],
        queries: [
          { id: 1, to: 'Data Structures', subject: 'Circular queue: full vs empty', msg: 'When front equals rear, how do we know whether the circular queue is full or empty?', date: '25/09/2026', reply: 'Either keep one slot empty or track a count of elements. We will work through both in Thursday’s class.', seen: true }
        ],
        receipts: [{ no: 'AIMS/FEE/2026/0188', date: '14/07/2026', desc: 'Term 1 fees: tuition, library and transport', amt: '₹ 56,500' }],
        leaves: [
          { id: 2, type: 'On duty', from: '2026-09-19', to: '2026-09-19', reason: 'Faculty development programme', status: 'Approved' },
          { id: 1, type: 'Casual leave', from: '2026-09-12', to: '2026-09-12', reason: 'Personal work', status: 'Approved' }
        ],
        feePaid: false, payMethod: 'upi',
        roster: { '25A51A0504': 'A', '25A51A0511': 'A' }, attSaved: '',
        attClass: 'II CSE-A', attSubject: 'Data Structures', attPeriod: 'Period 1 · 09:30', attDate: new Date().toISOString().slice(0, 10),
        marks: marks, mClass: 'II CSE-A', mExam: 'Mid-I',
        qTo: 'Data Structures', qSubject: '', qText: '',
        nText: '', nAudience: 'All II B.Tech CSE students',
        aTitle: '', aSubject: 'Data Structures', aClass: 'II CSE-A', aDue: '2026-10-10',
        drafts: {},
        lType: 'Casual leave', lFrom: '2026-10-05', lTo: '2026-10-05', lReason: '',
        toast: ''
      };
    }
    return Object.assign({}, this._init, this.state || {});
  }

  flash(msg) {
    this.setState({ toast: msg });
    clearTimeout(this._t);
    this._t = setTimeout(() => this.setState({ toast: '' }), 3000);
  }

  componentWillUnmount() { clearTimeout(this._t); }

  renderVals() {
    const s = this.st();
    const self = this;
    const on = (patch) => () => self.setState(patch);
    const val = (k) => (e) => self.setState({ [k]: e.target.value });
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmt = (d) => { const p = String(d || '').split('-'); return p.length === 3 ? p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0] : d; };
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB');
    const inr = (n) => '₹ ' + n.toLocaleString('en-IN');

    // palette: ink #15171C, muted #5A606B, accent #0D2D52, success #1F6B47, danger #B3261E
    const PILL = { Approved: ['#EAF5EF', '#1F6B47'], Submitted: ['#EAF5EF', '#1F6B47'], Answered: ['#EAF5EF', '#1F6B47'], Pending: ['#EFF2F6', '#4A4F58'], Awaiting: ['#EFF2F6', '#4A4F58'], Declined: ['#FBEEEC', '#9B2019'] };
    const pill = (k) => PILL[k] || ['#EFF2F6', '#4A4F58'];

    const nav = (cur, keys, prop) => { const o = {}; keys.forEach((k) => { const a = cur === k; o[k] = { bg: a ? '#EEF3F8' : 'transparent', fg: a ? '#0D2D52' : '#5A606B', go: on({ [prop]: k }) }; }); return o; };
    const flags = (cur, keys) => { const o = {}; keys.forEach((k) => { o[k] = cur === k; }); return o; };
    const tabs = (cur, keys, prop) => { const o = {}; keys.forEach((k) => { const a = cur === k; o[k] = { fg: a ? '#0D2D52' : '#6B7079', bd: a ? '#0D2D52' : 'transparent', go: on({ [prop]: k }) }; }); return o; };

    const sKeys = ['home', 'basic', 'academic', 'exams', 'fees', 'marks', 'downloads', 'ask', 'contact'];
    const tKeys = ['home', 'attendance', 'marks', 'assignments', 'notices', 'queries', 'leave'];
    const sTitles = { home: 'Dashboard', basic: 'Basic Information', academic: 'Academic Information', exams: 'Exam Time Tables', fees: 'Online Fee Payments', marks: 'Marks Details', downloads: 'Downloads', ask: 'Ask Faculty', contact: 'Contact Us' };
    const tTitles = { home: 'Dashboard', attendance: 'Attendance', marks: 'Marks Entry', assignments: 'Assignments', notices: 'Notice Board', queries: 'Student Queries', leave: 'Leave' };

    // Login
    const isT = s.role === 'teacher';
    const segOn = { bg: '#FFFFFF', fg: '#15171C', sh: '0 1px 2px rgba(21,23,28,.08)' };
    const segOff = { bg: 'transparent', fg: '#5A606B', sh: 'none' };
    const signIn = () => {
      const cur = self.st();
      if (!String(cur.loginId).trim()) return self.setState({ loginErr: true });
      self.setState({ screen: cur.role === 'teacher' ? 'teacher' : 'student', loginErr: false, sSec: 'home', tSec: 'home' });
    };

    // Timetable
    const NAMES = { DS: 'Data Structures', DM: 'Discrete Mathematics', DLD: 'Digital Logic Design', OOPJ: 'OOP through Java', CO: 'Computer Organization', BEFA: 'Business Economics & Financial Analysis', 'DS LAB': 'Data Structures Lab', 'JAVA LAB': 'Java Programming Lab', LIB: 'Library hour', MENTOR: 'Mentoring', SPORTS: 'Sports & games' };
    const TIMES = ['09:30 – 10:20', '10:20 – 11:10', '11:20 – 12:10', '12:10 – 01:00', '01:00 – 01:40', '01:40 – 02:30', '02:30 – 03:20'];
    const DAYS = {
      MON: ['DS', 'DM', 'DLD', 'OOPJ', 'LUNCH', 'CO', 'BEFA'],
      TUE: ['DLD', 'DS', 'CO', 'DM', 'LUNCH', 'DS LAB', 'DS LAB'],
      WED: ['OOPJ', 'CO', 'DS', 'BEFA', 'LUNCH', 'DM', 'LIB'],
      THU: ['DM', 'OOPJ', 'DLD', 'DS', 'LUNCH', 'JAVA LAB', 'JAVA LAB'],
      FRI: ['CO', 'BEFA', 'OOPJ', 'DLD', 'LUNCH', 'DS', 'MENTOR'],
      SAT: ['DS', 'DM', 'CO', 'OOPJ', 'LUNCH', 'SPORTS', 'SPORTS']
    };
    const head = { bg: 'transparent', fg: '#6B7079', bd: 'transparent', w: 500, size: 12 };
    const ttCells = [Object.assign({ t: '' }, head)].concat(TIMES.map((t) => Object.assign({ t: t }, head)));
    Object.keys(DAYS).forEach((d) => {
      ttCells.push({ t: d.charAt(0) + d.slice(1).toLowerCase(), bg: 'transparent', fg: '#15171C', bd: 'transparent', w: 600, size: 13 });
      DAYS[d].forEach((c) => {
        const lunch = c === 'LUNCH';
        const lab = c.indexOf('LAB') > -1;
        ttCells.push(lunch ? { t: 'Lunch', bg: 'transparent', fg: '#6B7079', bd: 'transparent', w: 400, size: 12 }
          : lab ? { t: c, bg: '#EEF3F8', fg: '#0D2D52', bd: '#EEF3F8', w: 500, size: 13 }
          : { t: c, bg: '#FFFFFF', fg: '#15171C', bd: '#E4E8EE', w: 500, size: 13 });
      });
    });
    const ttLegend = Object.keys(NAMES).map((k) => ({ code: k, name: NAMES[k] }));
    const dayKey = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
    const todayClasses = (DAYS[dayKey] || []).map((c, i) => ({ code: c, name: NAMES[c] || c, time: TIMES[i] })).filter((c) => c.code !== 'LUNCH');

    // Attendance (student)
    const SUBJ = [['Data Structures', 42, 38], ['Discrete Mathematics', 40, 33], ['Digital Logic Design', 38, 35], ['OOP through Java', 41, 37], ['Computer Organization', 36, 26], ['Business Economics & Financial Analysis', 30, 26], ['Data Structures Lab', 14, 14], ['Java Programming Lab', 12, 11]];
    let held = 0, att = 0;
    const lows = [];
    const attendance = SUBJ.map((r) => {
      held += r[1]; att += r[2];
      const pct = Math.round(r[2] * 100 / r[1]);
      if (pct < 75) lows.push(r[0]);
      return { name: r[0], held: r[1], att: r[2], pct: pct, color: pct < 75 ? '#B3261E' : '#0D2D52' };
    });
    const overall = Math.round(att * 100 / held);

    // Assignments
    const sAssign = s.assignments.map((a) => {
      const p = pill(a.status);
      return {
        title: a.title, subject: a.subject, dueFmt: fmt(a.due), status: a.status, pillBg: p[0], pillFg: p[1],
        canSubmit: a.status === 'Pending',
        submit: () => { const cur = self.st(); self.setState({ assignments: cur.assignments.map((x) => x.id === a.id ? Object.assign({}, x, { status: 'Submitted' }) : x) }); self.flash('Submitted: ' + a.title); }
      };
    });
    const pendingAssign = sAssign.filter((a) => a.canSubmit);
    const pendingSorted = s.assignments.filter((a) => a.status === 'Pending').sort((a, b) => (a.due < b.due ? -1 : 1));

    // Exams
    const EXAMS = {
      mid1: { title: 'Mid-I examinations · October 2026', rows: [['13 Oct 2026', 'Tue', '10:00 – 11:30 AM', 'Data Structures', 'CS301PC'], ['14 Oct 2026', 'Wed', '10:00 – 11:30 AM', 'Discrete Mathematics', 'MA302BS'], ['15 Oct 2026', 'Thu', '10:00 – 11:30 AM', 'Digital Logic Design', 'EC303ES'], ['16 Oct 2026', 'Fri', '10:00 – 11:30 AM', 'OOP through Java', 'CS304PC'], ['17 Oct 2026', 'Sat', '10:00 – 11:30 AM', 'Computer Organization', 'CS305PC'], ['19 Oct 2026', 'Mon', '10:00 – 11:30 AM', 'Business Economics & Financial Analysis', 'SM306MS']] },
      mid2: { title: 'Mid-II examinations · December 2026', rows: [['14 Dec 2026', 'Mon', '10:00 – 11:30 AM', 'Data Structures', 'CS301PC'], ['15 Dec 2026', 'Tue', '10:00 – 11:30 AM', 'Discrete Mathematics', 'MA302BS'], ['16 Dec 2026', 'Wed', '10:00 – 11:30 AM', 'Digital Logic Design', 'EC303ES'], ['17 Dec 2026', 'Thu', '10:00 – 11:30 AM', 'OOP through Java', 'CS304PC'], ['18 Dec 2026', 'Fri', '10:00 – 11:30 AM', 'Computer Organization', 'CS305PC'], ['19 Dec 2026', 'Sat', '10:00 – 11:30 AM', 'Business Economics & Financial Analysis', 'SM306MS']] },
      sem: { title: 'Semester-end examinations · January 2027', rows: [['04 Jan 2027', 'Mon', '10:00 AM – 01:00 PM', 'Data Structures', 'CS301PC'], ['06 Jan 2027', 'Wed', '10:00 AM – 01:00 PM', 'Discrete Mathematics', 'MA302BS'], ['08 Jan 2027', 'Fri', '10:00 AM – 01:00 PM', 'Digital Logic Design', 'EC303ES'], ['11 Jan 2027', 'Mon', '10:00 AM – 01:00 PM', 'OOP through Java', 'CS304PC'], ['13 Jan 2027', 'Wed', '10:00 AM – 01:00 PM', 'Computer Organization', 'CS305PC'], ['15 Jan 2027', 'Fri', '10:00 AM – 01:00 PM', 'Business Economics & Financial Analysis', 'SM306MS']] }
    };
    const exam = EXAMS[s.examTab] || EXAMS.mid1;

    // Fees
    const FEES = [['Tuition fee, instalment 2', 45000], ['Examination fee, I Semester', 1200], ['Library and laboratory fee', 2500], ['Transport fee, term 2', 9000]];
    const feeTotalN = FEES.reduce((t, f) => t + f[1], 0);
    const METHOD_LABEL = { upi: 'UPI', card: 'Card', netbanking: 'Net banking' };
    const pm = {};
    ['upi', 'card', 'netbanking'].forEach((k) => { const a = s.payMethod === k; pm[k] = { on: a, bd: a ? '#15171C' : '#E4E8EE', bg: a ? '#F8FAFC' : '#FFFFFF', dot: a ? '#15171C' : '#D5DBE3', go: on({ payMethod: k }) }; });
    const payNow = () => {
      const cur = self.st();
      const no = 'AIMS/FEE/2026/0' + (412 + cur.receipts.length);
      self.setState({ feePaid: true, receipts: [{ no: no, date: todayStr, desc: 'Term 2 fees via ' + METHOD_LABEL[cur.payMethod], amt: inr(feeTotalN) }].concat(cur.receipts) });
      self.flash('Payment successful. Receipt ' + no);
    };

    // Downloads
    const DL = [['Mid-I hall ticket', 'PDF · available from 06 Oct 2026'], ['Academic calendar 2026–27', 'PDF · 180 KB'], ['II B.Tech syllabus (CSE)', 'PDF · 1.2 MB'], ['Fee structure 2026–27', 'PDF · 96 KB'], ['Bonafide certificate request form', 'PDF · 64 KB'], ['Previous question papers, I Sem', 'ZIP · 4.8 MB']];
    const downloads = DL.map((d) => ({ name: d[0], meta: d[1], dl: () => self.flash('Downloading ' + d[0]) }));

    // Queries
    const qView = (q) => {
      const p = pill(q.reply ? 'Answered' : 'Awaiting');
      return { id: q.id, to: q.to, subject: q.subject, msg: q.msg, date: q.date, reply: q.reply || '', hasReply: !!q.reply, pending: !q.reply, status: q.reply ? 'Answered' : 'Awaiting reply', pillBg: p[0], pillFg: p[1] };
    };
    const myQueries = s.queries.map(qView);
    const pendingQ = s.queries.filter((q) => !q.reply).length;
    const newReplies = s.queries.filter((q) => q.reply && !q.seen).length;
    const sendQuery = () => {
      const cur = self.st();
      if (!cur.qSubject.trim() || !cur.qText.trim()) return self.flash('Add a topic and a message first');
      self.setState({ queries: [{ id: Date.now(), to: cur.qTo, subject: cur.qSubject.trim(), msg: cur.qText.trim(), date: todayStr, reply: '' }].concat(cur.queries), qSubject: '', qText: '' });
      self.flash('Sent to ' + cur.qTo + ' faculty');
    };
    const tQueries = s.queries.map((q) => Object.assign(qView(q), {
      rid: 'reply-' + q.id,
      draft: s.drafts[q.id] || '',
      onDraft: (e) => { const cur = self.st(); self.setState({ drafts: Object.assign({}, cur.drafts, { [q.id]: e.target.value }) }); },
      send: () => {
        const cur = self.st();
        const text = String(cur.drafts[q.id] || '').trim();
        if (!text) return self.flash('Write a reply first');
        self.setState({ queries: cur.queries.map((x) => x.id === q.id ? Object.assign({}, x, { reply: text, seen: false }) : x) });
        self.flash('Reply sent. The student sees it in Ask Faculty.');
      }
    }));

    // Notices
    const notices = s.notices.map((n) => ({ date: n.date, no: n.no, msg: n.msg, by: n.by, isNew: !!n.isNew }));
    const postNotice = () => {
      const cur = self.st();
      if (!cur.nText.trim()) return self.flash('Write the notice first');
      self.setState({ notices: [{ id: Date.now(), date: todayStr, no: '26-27/0' + (9 + cur.notices.length), msg: cur.nText.trim(), by: 'Dept. of CSE · ' + cur.nAudience, isNew: true }].concat(cur.notices), nText: '' });
      self.flash('Notice posted. Students can see it now.');
    };

    // Faculty attendance
    const status = (r) => s.roster[r] || 'P';
    const setRoll = (r, v) => () => { const cur = self.st(); self.setState({ roster: Object.assign({}, cur.roster, { [r]: v }) }); };
    const raised = '0 1px 2px rgba(21,23,28,.1)';
    const roster = s.rolls.map((r, i) => {
      const p = status(r) === 'P';
      return {
        sno: String(i + 1).padStart(2, '0'), roll: r, isP: p, isA: !p,
        pBg: p ? '#FFFFFF' : 'transparent', pFg: p ? '#15171C' : '#6B7079', pSh: p ? raised : 'none',
        aBg: !p ? '#B3261E' : 'transparent', aFg: !p ? '#FFFFFF' : '#6B7079', aSh: !p ? raised : 'none',
        markP: setRoll(r, 'P'), markA: setRoll(r, 'A')
      };
    });
    const present = roster.filter((r) => r.isP).length;

    // Faculty marks
    const marksRows = s.rolls.map((r, i) => {
      const v = s.marks[r] || '';
      const p = v === '' ? ['#EFF2F6', '#4A4F58'] : ['#EAF5EF', '#1F6B47'];
      return {
        sno: String(i + 1).padStart(2, '0'), roll: r, id: 'mk-' + r, value: v, status: v === '' ? 'Pending' : 'Entered', pillBg: p[0], pillFg: p[1],
        onChange: (e) => {
          let nv = String(e.target.value).replace(/\D/g, '').slice(0, 2);
          if (nv !== '' && +nv > 30) nv = '30';
          const cur = self.st();
          self.setState({ marks: Object.assign({}, cur.marks, { [r]: nv }) });
        }
      };
    });
    const marksEntered = marksRows.filter((m) => m.value !== '').length;

    // Faculty assignments
    const tAssign = s.assignments.map((a) => {
      const n = (a.base || 0) + (a.status === 'Submitted' ? 1 : 0);
      return { title: a.title, cls: a.cls, subject: a.subject, dueFmt: fmt(a.due), submitted: n, subPct: Math.round(n * 100 / 62) };
    });
    const subTotal = tAssign.reduce((t, a) => t + a.submitted, 0);
    const publishAssign = () => {
      const cur = self.st();
      if (!cur.aTitle.trim()) return self.flash('Give the assignment a title');
      self.setState({ assignments: [{ id: Date.now(), title: cur.aTitle.trim(), subject: cur.aSubject, cls: cur.aClass, due: cur.aDue, status: 'Pending', base: 0 }].concat(cur.assignments), aTitle: '' });
      self.flash('Published to ' + cur.aClass + '. Students see it under Assignments.');
    };

    // Leave
    const leaveView = (l) => { const p = pill(l.status); return { type: l.type, reason: l.reason, status: l.status, range: l.from === l.to ? fmt(l.from) : fmt(l.from) + ' – ' + fmt(l.to), pillBg: p[0], pillFg: p[1] }; };
    const leaves = s.leaves.map(leaveView);
    const clUsed = s.leaves.filter((l) => l.type === 'Casual leave').length;
    const applyLeave = () => {
      const cur = self.st();
      if (!cur.lReason.trim()) return self.flash('Add a reason for the leave');
      if (cur.lTo < cur.lFrom) return self.flash('The end date is before the start date');
      self.setState({ leaves: [{ id: Date.now(), type: cur.lType, from: cur.lFrom, to: cur.lTo, reason: cur.lReason.trim(), status: 'Pending' }].concat(cur.leaves), lReason: '' });
      self.flash('Leave request sent to HOD');
    };

    // Faculty today
    const TC = [['09:30 – 10:20', 'II CSE-A', 'Data Structures', 'Room 204', 'done'], ['10:20 – 11:10', 'II CSE-B', 'Data Structures', 'Room 206', 'done'], ['11:20 – 01:00', 'II CSE-A', 'Data Structures Lab', 'Lab 3', 'now'], ['01:40 – 02:30', 'III CSE-A', 'Compiler Design', 'Room 305', 'next'], ['02:30 – 03:20', 'II CSE-B', 'Mentoring', 'Room 206', 'next']];
    const tClasses = TC.map((c) => {
      const k = c[4];
      const p = k === 'now' ? ['#EEF3F8', '#0D2D52'] : k === 'done' ? ['#EFF2F6', '#4A4F58'] : ['#FFFFFF', '#4A4F58'];
      return { time: c[0], cls: c[1], subject: c[2], room: c[3], label: k === 'done' ? 'Done' : k === 'now' ? 'In progress' : 'Upcoming', fg: k === 'done' ? '#6B7079' : '#15171C', pillBg: p[0], pillFg: p[1] };
    });
    const hour = now.getHours();

    return {
      isLogin: s.screen === 'login', isStudent: s.screen === 'student', isTeacher: s.screen === 'teacher',
      roleS: isT ? segOff : segOn, roleT: isT ? segOn : segOff,
      pickStudent: on({ role: 'student', loginErr: false }), pickTeacher: on({ role: 'teacher', loginErr: false }),
      idLabel: isT ? 'Employee ID' : 'Hall Ticket No.', idPlaceholder: isT ? 'e.g. AIMS-FAC-0000' : 'e.g. 25XXXXXXXX',
      portalName: isT ? 'Faculty Portal' : 'Student Portal',
      loginId: s.loginId, loginErr: s.loginErr, onLoginId: val('loginId'),
      loginKey: (e) => { if (e.key === 'Enter') signIn(); },
      signIn: signIn,
      forgot: () => self.flash('A reset link will be sent to your registered college email'),
      logout: on({ screen: 'login', loginId: '', loginErr: false }),
      toTeacher: on({ screen: 'teacher', role: 'teacher' }),
      toStudent: on({ screen: 'student', role: 'student' }),
      todayLong: now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      todayShort: now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      greeting: hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening',

      // student shell
      sn: nav(s.sSec, sKeys, 'sSec'), ss: flags(s.sSec, sKeys), sTitle: sTitles[s.sSec],
      hasNewNotices: s.notices.some((n) => n.isNew),
      hasNewReplies: newReplies > 0, newReplies: newReplies,
      goTimetable: on({ sSec: 'academic', acadTab: 'timetable' }),
      goAssignments: on({ sSec: 'academic', acadTab: 'assignments' }),

      // student home
      overall: overall, overallDeg: Math.round(overall * 3.6), attTotal: held, attAttended: att, attMissed: held - att,
      lowNote: lows.length ? 'Below 75% in ' + lows.join(', ') + '. Attend upcoming classes to stay eligible for exams.' : 'You are above 75% in every subject.',
      cgpa: '8.43',
      feeDue: s.feePaid ? inr(0) : inr(feeTotalN), feeDueNote: s.feePaid ? 'All fees paid' : 'Due by 10 Oct 2026',
      pendingCount: pendingSorted.length,
      nextDueNote: pendingSorted.length ? 'Next due ' + fmt(pendingSorted[0].due) : 'Nothing due',
      notices: notices,
      todayClasses: todayClasses, noClasses: todayClasses.length === 0,
      pendingAssign: pendingAssign, noPending: pendingAssign.length === 0,

      // basic
      personal: [{ k: 'Full name', v: '[Student Name]' }, { k: 'Date of birth', v: '[DD/MM/YYYY]' }, { k: 'Gender', v: '[Gender]' }, { k: 'Blood group', v: '[Blood group]' }, { k: 'Mobile', v: '[Mobile number]' }, { k: 'College email', v: '[College email]' }, { k: 'Aadhaar', v: 'Hidden for privacy' }, { k: 'Category', v: '[Category]' }, { k: 'Address', v: '[Residential address]' }],
      admission: [{ k: 'Hall Ticket No.', v: '[Roll No.]' }, { k: 'Programme', v: 'B.Tech, CSE' }, { k: 'Batch', v: '2025–29' }, { k: 'Admission type', v: '[Admission type]' }, { k: 'Regulation', v: '[Regulation]' }, { k: 'Mentor', v: '[Mentor name]' }],
      guardian: [{ k: 'Guardian name', v: '[Guardian name]' }, { k: 'Relation', v: '[Relation]' }, { k: 'Guardian mobile', v: '[Mobile number]' }],
      requestCorrection: () => self.flash('Correction request sent to the Academic Office'),

      // academic
      at: tabs(s.acadTab, ['attendance', 'timetable', 'assignments', 'syllabus'], 'acadTab'),
      af: flags(s.acadTab, ['attendance', 'timetable', 'assignments', 'syllabus']),
      attendance: attendance, ttCells: ttCells, ttLegend: ttLegend,
      dlTimetable: () => self.flash('Downloading timetable PDF'),
      sAssign: sAssign,
      syllabus: [
        { name: 'Data Structures', pct: 68, unit: 4, topic: 'Trees and BSTs' },
        { name: 'Discrete Mathematics', pct: 55, unit: 3, topic: 'Graph theory' },
        { name: 'Digital Logic Design', pct: 60, unit: 3, topic: 'Sequential circuits' },
        { name: 'OOP through Java', pct: 62, unit: 3, topic: 'Exception handling' },
        { name: 'Computer Organization', pct: 48, unit: 3, topic: 'Memory hierarchy' },
        { name: 'Business Economics & Financial Analysis', pct: 52, unit: 3, topic: 'Cost analysis' }
      ],

      // exams
      et: tabs(s.examTab, ['mid1', 'mid2', 'sem'], 'examTab'),
      examTitle: exam.title,
      examRows: exam.rows.map((r) => ({ date: r[0], day: r[1], time: r[2], sub: r[3], code: r[4] })),
      dlHallTicket: () => self.flash('Hall ticket download opens 06 Oct 2026'),

      // fees
      ft: tabs(s.feeTab, ['pay', 'receipts'], 'feeTab'),
      ff: flags(s.feeTab, ['pay', 'receipts']),
      feeItems: FEES.map((f) => ({ desc: f[0], amt: inr(f[1]) })),
      feeTotal: inr(feeTotalN), feeOpen: !s.feePaid, feePaid: s.feePaid, pm: pm, payNow: payNow,
      lastReceipt: s.receipts.length ? s.receipts[0].no : '',
      receipts: s.receipts.map((r) => Object.assign({}, r, { dl: () => self.flash('Downloading receipt ' + r.no) })),

      // marks
      mt: tabs(s.marksTab, ['internal', 'sem'], 'marksTab'),
      mf: flags(s.marksTab, ['internal', 'sem']),
      internal: [
        { sub: 'Data Structures', mid1: '26', asg: '5', mid2: '—', total: '31' },
        { sub: 'Discrete Mathematics', mid1: '22', asg: '4', mid2: '—', total: '26' },
        { sub: 'Digital Logic Design', mid1: '27', asg: '5', mid2: '—', total: '32' },
        { sub: 'OOP through Java', mid1: '24', asg: '5', mid2: '—', total: '29' },
        { sub: 'Computer Organization', mid1: '19', asg: '4', mid2: '—', total: '23' },
        { sub: 'Business Economics & Financial Analysis', mid1: '25', asg: '5', mid2: '—', total: '30' }
      ],
      semResults: [
        { sem: 'I Year · I Semester', pub: 'Feb 2026', credits: '20 / 20', result: 'Passed', sgpa: '8.21', width: 82 },
        { sem: 'I Year · II Semester', pub: 'Jul 2026', credits: '20 / 20', result: 'Passed', sgpa: '8.64', width: 86 }
      ],
      dlMemo: () => self.flash('Downloading consolidated marks memo'),

      downloads: downloads,

      // ask faculty
      myQueries: myQueries,
      qTo: s.qTo, qSubject: s.qSubject, qText: s.qText,
      onQTo: val('qTo'), onQSubject: val('qSubject'), onQText: val('qText'),
      sendQuery: sendQuery,

      contacts: [
        { dept: 'Examination Branch', desc: 'Hall tickets, results, revaluation', mail: 'Exam branch', hours: 'Mon–Sat, 9:30 AM – 4:30 PM' },
        { dept: 'Accounts Section', desc: 'Fee payments, receipts, scholarships', mail: 'Accounts', hours: 'Mon–Sat, 9:30 AM – 4:00 PM' },
        { dept: 'Academic Office', desc: 'Certificates, bonafide, corrections', mail: 'Academic office', hours: 'Mon–Sat, 9:30 AM – 4:30 PM' },
        { dept: 'Transport Desk', desc: 'Bus routes, passes, pickup points', mail: 'Transport', hours: 'Mon–Sat, 8:00 AM – 5:00 PM' }
      ],

      // faculty shell
      tn: nav(s.tSec, tKeys, 'tSec'), ts: flags(s.tSec, tKeys), tTitle: tTitles[s.tSec],
      pendingQ: pendingQ, hasPendingQ: pendingQ > 0,
      subTotal: subTotal, assignCount: s.assignments.length,
      tClasses: tClasses,
      lessonPlan: [{ cls: 'II CSE-A', sub: 'Data Structures', pct: 68 }, { cls: 'II CSE-B', sub: 'Data Structures', pct: 61 }, { cls: 'II CSE-A', sub: 'DS Lab', pct: 70 }, { cls: 'III CSE-A', sub: 'Compiler Design', pct: 54 }],
      noticesTop: notices.slice(0, 4), queriesTop: myQueries.slice(0, 3),

      // faculty attendance
      attClass: s.attClass, attSubject: s.attSubject, attDate: s.attDate, attPeriod: s.attPeriod,
      onAttClass: val('attClass'), onAttSubject: val('attSubject'), onAttDate: val('attDate'), onAttPeriod: val('attPeriod'),
      roster: roster, present: present, absent: roster.length - present, rosterCount: roster.length,
      allPresent: on({ roster: {} }),
      attSaved: s.attSaved, attIsSaved: !!s.attSaved,
      submitAtt: () => {
        const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        self.setState({ attSaved: t });
        self.flash('Attendance saved: ' + present + ' present, ' + (roster.length - present) + ' absent');
      },

      // faculty marks
      mClass: s.mClass, mExam: s.mExam, onMClass: val('mClass'), onMExam: val('mExam'),
      marksRows: marksRows, marksEntered: marksEntered,
      saveMarks: () => self.flash(s.mExam + ' marks saved for ' + marksEntered + ' students'),

      // faculty assignments
      aTitle: s.aTitle, aSubject: s.aSubject, aClass: s.aClass, aDue: s.aDue,
      onATitle: val('aTitle'), onASubject: val('aSubject'), onAClass: val('aClass'), onADue: val('aDue'),
      publishAssign: publishAssign, tAssign: tAssign,

      // faculty notices
      nText: s.nText, nAudience: s.nAudience, onNText: val('nText'), onNAudience: val('nAudience'), postNotice: postNotice,

      // faculty queries
      tQueries: tQueries, noQueries: tQueries.length === 0,

      // faculty leave
      lType: s.lType, lFrom: s.lFrom, lTo: s.lTo, lReason: s.lReason,
      onLType: val('lType'), onLFrom: val('lFrom'), onLTo: val('lTo'), onLReason: val('lReason'),
      applyLeave: applyLeave, leaves: leaves, clLeft: 12 - clUsed,

      toast: s.toast, hasToast: !!s.toast
    };
  }

  componentDidUpdate() {
    // mark replies as seen once the student opens Ask Faculty
    const s = this.st();
    if (s.screen === 'student' && s.sSec === 'ask' && s.queries.some((q) => q.reply && !q.seen)) {
      this.setState({ queries: s.queries.map((q) => q.reply ? Object.assign({}, q, { seen: true }) : q) });
    }
  }
}

// ---------------------------------------------------------------------------
// Tiny renderer for the <template id="tpl"> markup.
// Supports {{path}} holes, <sc-if value>, <sc-for list as>, and on* events.
// ponytail: re-renders the whole page on every state change (fine at this
// size); move to a framework (React/Vue) when this grows into a real app.
// ---------------------------------------------------------------------------
const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
const WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;
const EVENTS = { onclick: 'click', onchange: 'input', onkeydown: 'keydown' };

function lookup(scope, path) {
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
}
const fill = (str, scope) => str.replace(HOLE, (_, p) => { const v = lookup(scope, p); return v == null ? '' : String(v); });

function build(node, scope, parent) {
  if (node.nodeType === 3) { parent.appendChild(document.createTextNode(fill(node.nodeValue, scope))); return; }
  if (node.nodeType !== 1) return;
  const tag = node.localName;
  if (tag === 'sc-if') {
    if (lookup(scope, node.getAttribute('value').match(WHOLE)[1])) node.childNodes.forEach((c) => build(c, scope, parent));
    return;
  }
  if (tag === 'sc-for') {
    const list = lookup(scope, node.getAttribute('list').match(WHOLE)[1]) || [];
    const as = node.getAttribute('as');
    list.forEach((item, i) => {
      const s = Object.create(scope); s[as] = item; s.$index = i;
      node.childNodes.forEach((c) => build(c, s, parent));
    });
    return;
  }
  const el = node.cloneNode(false); // keeps the SVG namespace for icons
  if (tag === 'img') el.decoding = 'sync'; // cached logo repaints without flicker on re-render
  let value;
  for (const { name, value: raw } of Array.from(node.attributes)) {
    if (name.startsWith('hint-')) { el.removeAttribute(name); continue; }
    const whole = raw.match(WHOLE);
    if (EVENTS[name]) {
      el.removeAttribute(name);
      const fn = whole && lookup(scope, whole[1]);
      if (typeof fn === 'function') el.addEventListener(EVENTS[name], fn);
    } else if (name === 'value' && /^(input|textarea|select)$/.test(tag)) {
      el.removeAttribute(name);
      value = fill(raw, scope);
    } else if (raw.indexOf('{{') > -1) {
      el.setAttribute(name, fill(raw, scope));
    }
  }
  const kids = tag === 'template' ? node.content.childNodes : node.childNodes;
  kids.forEach((c) => build(c, scope, el));
  if (value !== undefined) el.value = value;
  parent.appendChild(el);
}


const app = document.getElementById('app');
const tpl = document.getElementById('tpl').content;
const comp = new Component();
let queued = false;
function schedule() { if (!queued) { queued = true; queueMicrotask(render); } }

let lastSection = '';
function render() {
  queued = false;
  // keep focus, caret and scroll position across re-renders
  const a = document.activeElement;
  const focusId = a && a.id;
  const caret = a && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null;
  const scrolls = Array.from(app.querySelectorAll('.scroll')).map((e) => e.scrollTop);

  const frag = document.createDocumentFragment();
  tpl.childNodes.forEach((c) => build(c, comp.renderVals(), frag));
  app.replaceChildren(frag);

  const s = comp.st();
  const section = s.screen + s.sSec + s.tSec;
  if (section === lastSection) app.querySelectorAll('.scroll').forEach((e, i) => { e.scrollTop = scrolls[i] || 0; });
  lastSection = section;
  const f = focusId && document.getElementById(focusId);
  if (f) { f.focus(); if (caret) try { f.setSelectionRange(caret[0], caret[1]); } catch (e) { /* date/select inputs */ } }
  if (comp.componentDidUpdate) comp.componentDidUpdate();
}
render();
