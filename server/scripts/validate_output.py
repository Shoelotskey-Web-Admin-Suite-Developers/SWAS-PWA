import json
from collections import defaultdict
trs=json.load(open('c:\\\\Users\\\\Lagman\\\\Desktop\\\\Codes\\\\SWAS PWA\\\\SWAS-PWA\\\\server\\\\scripts\\\\output\\\\transactions.json'))
unav=json.load(open('c:\\\\Users\\\\Lagman\\\\Desktop\\\\Codes\\\\SWAS PWA\\\\SWAS-PWA\\\\server\\\\scripts\\\\output\\\\unavailability.json'))
full_unav=set((u['branch_id'],u['date_unavailable']) for u in unav if u['type']=='Full Day')
bd=defaultdict(int)
for t in trs:
    d=str(t['date_in']).split(' ')[0]
    bd[(t['branch_id'],d)]+=1
violations=[]
for b,d in full_unav:
    if bd.get((b,d),0)>0:
        violations.append(((b,d),bd[(b,d)]))
print('transactions total:',len(trs))
print('full unavailability count:',len(full_unav))
print('violations (should be empty):',violations[:5])

promos=json.load(open('c:\\\\Users\\\\Lagman\\\\Desktop\\\\Codes\\\\SWAS PWA\\\\SWAS-PWA\\\\server\\\\scripts\\\\output\\\\promos.json'))
promo_dates_by_branch=defaultdict(set)
for p in promos:
    for d in p['promo_dates']:
        ds=d.split(' ')[0]
        promo_dates_by_branch[p['branch_id']].add(ds)
amounts_by_branch={'promo':defaultdict(list),'normal':defaultdict(list)}
for t in trs:
    d=str(t['date_in']).split(' ')[0]
    if d in promo_dates_by_branch[t['branch_id']]:
        amounts_by_branch['promo'][t['branch_id']].append(t['total_amount'])
    else:
        amounts_by_branch['normal'][t['branch_id']].append(t['total_amount'])
import statistics
all_branches=set(list(promo_dates_by_branch.keys())+[tr['branch_id'] for tr in trs])
for b in all_branches:
    promo_vals=amounts_by_branch['promo'].get(b,[])
    norm_vals=amounts_by_branch['normal'].get(b,[])
    print(b,'promo avg',statistics.mean(promo_vals) if promo_vals else None,'normal avg',statistics.mean(norm_vals) if norm_vals else None)
