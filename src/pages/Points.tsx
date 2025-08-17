import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserData } from '@/hooks/useUserData';
import { supabase, type Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type LedgerRow = Database['public']['Tables']['app_24b6a0157d_ip_ledger']['Row'];

export default function Points() {
  const { progress } = useUserData();
  const { user, loading: authLoading } = useAuth();
  const totalIP = progress?.total_ip ?? 0;

  const [typeFilter, setTypeFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setRows([]);
        setTotal(0);
        return;
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from('app_24b6a0157d_ip_ledger')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      query = query.eq('user_id', user.id);
      if (typeFilter === 'earn') query = query.gt('amount_delta', 0);
      if (typeFilter === 'spend') query = query.lt('amount_delta', 0);
      const trimmed = keyword.trim();
      if (trimmed) {
        const esc = trimmed.replace(/[,]/g, '');
        query = query.or(`activity.ilike.%${esc}%,description.ilike.%${esc}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setRows(data || []);
      setTotal(count || 0);
    } catch (e: any) {
      console.error('Failed to load ledger:', e);
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, page, authLoading, user?.id]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchRows();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  // Compute running balance for current page (only accurate for page 1 without filters)
  const computedBalances: number[] = (() => {
    if (page !== 1 || rows.length === 0) return [];
    if (typeFilter !== 'all') return [];
    if (keyword.trim() !== '') return [];
    let run = totalIP; // current available IP corresponds to balance after the most recent tx
    return rows.map((r) => {
      const bal = run; // balance after this transaction
      run -= r.amount_delta; // step back for next (older) row
      return bal;
    });
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">积分明细</h1>
          <p className="text-gray-600 mt-1">查看你的积分活动，支持类型筛选与关键词查询。</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              当前可用积分 <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{totalIP.toLocaleString()} IP</Badge>
            </CardTitle>
            <CardDescription>未来将支持积分赚取与消费的完整流水、过滤和分页。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={typeFilter} onValueChange={(v: 'all' | 'earn' | 'spend') => { setPage(1); setTypeFilter(v); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="earn">收入（获得）</SelectItem>
                  <SelectItem value="spend">支出（消费）</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="关键词（功能、来源等）" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              <Button variant="outline" onClick={handleApplyFilters}>查询</Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>变动</TableHead>
                    <TableHead>余额（结果）</TableHead>
                    <TableHead>描述</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-6">加载中...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-red-600 py-6">{error}</TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-6">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => {
                      const isEarn = r.amount_delta > 0;
                      return (
                        <TableRow key={r.id}>
                          <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={isEarn ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                            >
                              {isEarn ? '收入' : '消费'}
                            </Badge>
                          </TableCell>
                          <TableCell className={isEarn ? 'text-green-700' : 'text-red-600'}>
                            {isEarn ? `+${r.amount_delta}` : r.amount_delta}
                          </TableCell>
                          <TableCell>
                            {page === 1 && computedBalances[idx] !== undefined ? (
                              <span>{computedBalances[idx]}</span>
                            ) : (
                              <span>—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{r.activity}</div>
                            {r.description ? (
                              <div className="text-xs text-gray-500">{r.description}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">共 {total} 条 · 第 {page} / {totalPages} 页</div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>上一页</Button>
                <Button variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>下一页</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
