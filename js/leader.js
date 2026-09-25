        const SUPABASE_URL = "https://rlzswdiltesxldwdzdlf.supabase.co";
        const SUPABASE_ANON_KEY = "sb_publishable_fYbGrtavOW-foTMPxCKBbA_WxSCTrhE";

        const { createClient } = supabase;
        const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const FLAGS = {
            EG: '🇪🇬', SA: '🇸🇦', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧',
            JO: '🇯🇴', KW: '🇰🇼', QA: '🇶🇦', BH: '🇧🇭', OM: '🇴🇲',
            MA: '🇲🇦', TN: '🇹🇳', DZ: '🇩🇿', IQ: '🇮🇶', LB: '🇱🇧',
        };

        function rankBadgeClass(rank) {
            if (rank === 1) return 'rank-badge rank-1';
            if (rank === 2) return 'rank-badge rank-2';
            if (rank === 3) return 'rank-badge rank-3';
            return 'rank-badge';
        }

        function rowClass(rank) {
            return rank <= 3 ? 'top-rank' : '';
        }

        function medalOrAvatar(rank, avatarUrl) {
            if (avatarUrl) {
                return `<img src="${avatarUrl}" alt="avatar" style="width:100%;height:100%;border-radius:inherit;object-fit:cover;">`;
            }
            if (rank === 1) return '🥇';
            if (rank === 2) return '🥈';
            if (rank === 3) return '🥉';
            return '👤';
        }

        function showMessage(text, isError = false) {
            const box = document.getElementById('leaderboard-message');
            box.textContent = text;
            box.style.display = 'block';
            box.style.color = isError ? '#c0392b' : 'inherit';
        }

        function hideMessage() {
            document.getElementById('leaderboard-message').style.display = 'none';
        }

        async function loadLeaderboard() {
            hideMessage();
            const { data: authData } = await db.auth.getUser();
            const currentUserId = authData?.user?.id ?? null;

            const { data: rows, error } = await db
                .from('leaderboard')
                .select('*')
                .order('rank', { ascending: true });

            const tbody = document.getElementById('leaderboard-body');

            if (error) {
                tbody.innerHTML = '';
                showMessage('Could not load the leaderboard right now. Please try again later.', true);
                return;
            }

            if (!rows || rows.length === 0) {
                tbody.innerHTML = '';
                showMessage('No leaderboard data yet — be the first to play!');
                return;
            }

            tbody.innerHTML = rows.map(row => {
                const isCurrentUser = row.user_id === currentUserId;
                const flag = FLAGS[row.country_code] ?? '';
                const winRate = row.win_rate != null ? `${Math.round(row.win_rate)}%` : '—';
                const extraDetails =
                    `Highest tile: ${row.highest_tile ?? '—'} | Games played: ${row.games_played ?? 0} | Win rate: ${winRate}`;

                return `
                <tr class="${[rowClass(row.rank), isCurrentUser ? 'current-user-row' : ''].filter(Boolean).join(' ')}">
                    <td><span class="${rankBadgeClass(row.rank)}">${row.rank}</span></td>
                    <td>
                        <div class="intern">
                            <div class="avatar">${medalOrAvatar(row.rank, row.avatar_url)}</div>
                            <span class="intern-name">${row.username || row.full_name || 'Player'}</span>
                        </div>
                    </td>
                    <td><span class="track-tag">${row.track ?? '—'}</span></td>
                    <td>${flag} ${row.country ?? '—'}</td>
                    <td><span class="move same" title="Rank change data not available">—</span></td>
                    <td class="points-text" title="${extraDetails}">${(row.best_score ?? 0).toLocaleString()}</td>
                </tr>`;
            }).join('');
        }

        document.addEventListener('DOMContentLoaded', loadLeaderboard);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') loadLeaderboard();
        });