
       const SUPABASE_URL = "https://rlzswdiltesxldwdzdlf.supabase.co";
       const SUPABASE_ANON_KEY = "sb_publishable_fYbGrtavOW-foTMPxCKBbA_WxSCTrhE";

        const { createClient } = supabase;
        const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Tile "value -> class" map. Anything above 2048 falls back to a shared class.
        const TILE_CLASSES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

        function tileClass(value) {
            if (!value || value === 0) return 'tile empty';
            const known = TILE_CLASSES.includes(value) ? value : 'super';
            return `tile t-${known}`;
        }

        // Flattens a board that may be stored as a 4x4 array of arrays, or
        // already flat, into a single array of 16 values.
        function flattenBoard(board) {
            if (!board) return [];
            if (Array.isArray(board[0])) return board.flat();
            return board;
        }

        function renderBoard(board) {
            const grid = document.getElementById('current-game-grid');
            const cells = flattenBoard(board);
            if (!cells.length) return;
            grid.innerHTML = cells
                .map(v => `<div class="${tileClass(v)}">${v > 0 ? v : ''}</div>`)
                .join('');
        }

        function formatDuration(totalSeconds) {
            const seconds = Number(totalSeconds) || 0;
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            if (h > 0) return `${h}h ${m}m`;
            if (m > 0) return `${m}m ${s}s`;
            return `${s}s`;
        }

        function showMessage(text, isError = false) {
            const box = document.getElementById('dashboard-message');
            box.textContent = text;
            box.style.display = 'block';
            box.style.color = isError ? '#c0392b' : 'inherit';
        }

        function hideMessage() {
            document.getElementById('dashboard-message').style.display = 'none';
        }

        async function loadDashboard() {
            hideMessage();

            // 1. Authenticated user
            const { data: authData, error: authError } = await db.auth.getUser();
            if (authError || !authData?.user) {
                // No session — send back to login.
                location.href = 'index.html';
                return;
            }
            const user = authData.user;

            // 2. Profile row from public.users
            const { data: profile, error: profileError } = await db
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                showMessage('Could not load your profile. Please try again later.', true);
            } else if (profile) {
                document.getElementById('profile-name').textContent = profile.username || profile.full_name || 'Player';
                if (profile.avatar_url) {
                    document.getElementById('profile-avatar').innerHTML =
                        `<img src="${profile.avatar_url}" alt="avatar" style="width:100%;height:100%;border-radius:inherit;object-fit:cover;">`;
                }
            }

            // 3. Player stats
            const { data: stats, error: statsError } = await db
                .from('player_stats')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (statsError) {
                showMessage('Could not load your stats. Please try again later.', true);
            } else if (!stats) {
                // No stats row yet — new player, show zeros instead of fake data.
                document.getElementById('stat-best-score').textContent = '0';
                document.getElementById('stat-highest-tile').textContent = '—';
                document.getElementById('stat-games-played').textContent = '0';
                document.getElementById('stat-win-rate').textContent = '0%';
                document.getElementById('profile-streak').textContent = '0 Days';
                document.getElementById('stat-won-lost').textContent = '0 W / 0 L';
                document.getElementById('stat-avg-duration').textContent = '—';
                document.getElementById('stat-most-tile').textContent = '—';
                document.getElementById('stat-total-time').textContent = '0s';
            } else {
                const winRate = stats.games_played > 0
                    ? Math.round((stats.games_won / stats.games_played) * 100)
                    : 0;

                document.getElementById('stat-best-score').textContent = (stats.best_score ?? 0).toLocaleString();
                document.getElementById('stat-highest-tile').textContent = stats.highest_tile ?? '—';
                document.getElementById('stat-games-played').textContent = stats.games_played ?? 0;
                document.getElementById('stat-win-rate').textContent = `${winRate}%`;
                document.getElementById('profile-streak').textContent = `${stats.current_streak ?? 0} Days`;
                document.getElementById('stat-won-lost').textContent = `${stats.games_won ?? 0} W / ${stats.games_lost ?? 0} L`;
                document.getElementById('stat-avg-duration').textContent = formatDuration(stats.average_duration);
                document.getElementById('stat-most-tile').textContent = stats.highest_tile ?? '—';
                document.getElementById('stat-total-time').textContent = formatDuration(stats.total_playing_time);
            }

            // 4. Current in-progress game (if any)
            const { data: currentGame, error: gameError } = await db
                .from('games')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'playing')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const btn = document.getElementById('current-game-btn');

            if (gameError) {
                document.getElementById('current-game-score').textContent = 'Score: —';
            } else if (currentGame) {
                document.getElementById('current-game-score').textContent =
                    `Score: ${(currentGame.score ?? 0).toLocaleString()}`;
                renderBoard(currentGame.board);
                btn.textContent = 'Continue Game';
                btn.onclick = () => { location.href = `game.html?gameId=${currentGame.id}`; };
            } else {
                // No active game — empty state.
                document.getElementById('current-game-score').textContent = 'No active game';
                document.getElementById('current-game-grid').innerHTML =
                    Array(16).fill('<div class="tile empty"></div>').join('');
                btn.textContent = 'Start New Game';
                btn.onclick = () => { location.href = 'game.html'; };
            }
        }

        document.getElementById('logout-btn').addEventListener('click', async () => {
            await db.auth.signOut();
            location.href = 'index.html';
        });

        // Load on first visit, and refresh whenever the tab regains focus
        // (e.g. the player comes back from playing a game).
        document.addEventListener('DOMContentLoaded', loadDashboard);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') loadDashboard();
        });
    