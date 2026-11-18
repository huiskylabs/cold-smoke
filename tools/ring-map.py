# Full plan map of a ring line: terrain shade + relief tint, trees as crowns, run edges, lanes (gully/trees), the line's way and its rings numbered.
# python3 tools/ring-map.py <grid.json from tools/ring-map-grid.js> <plan.json from tools/ring-plan.js> <out_%d.png>
import json,sys,numpy as np,matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.collections import PatchCollection
from matplotlib.patches import Circle
for f in fm.findSystemFonts():
    if 'wqy' in f.lower(): fm.fontManager.addfont(f); plt.rcParams['font.family']=[fm.FontProperties(fname=f).get_name()]
plt.rcParams['axes.unicode_minus']=False
G=json.load(open(sys.argv[1])); P=json.load(open(sys.argv[2])); out=sys.argv[3]; d=P['diffs']['b']; T=P['terrain']
S=np.array([r['s'] for r in G]); CX=np.array([r['cx'] for r in G]); H=np.array([r['h'] for r in G]); U=np.arange(-90,91,2)
# local relief: height minus a smooth along-slope trend, hillshade from gradients
trend=np.array([np.convolve(H[:,k],np.ones(41)/41,mode='same') for k in range(H.shape[1])]).T
rel=H-np.median(H,axis=1,keepdims=True)
gs,gu=np.gradient(H,2,2); shade=np.clip(0.55+0.35*(-gu*0.7+gs*0.3)/np.sqrt(1+gu**2+gs**2)*3,0,1)
cxat=lambda s: np.interp(s,S,CX)
segs=T['segs']; NAME={'bowl':'开阔大坡','corridor':'林道','steeps':'陡坡','glade':'树林','kickers':'跳台','gully':'雪槽','ridge':'山脊','moguls':'蘑菇','powder':'深粉雪','rollers':'起伏'}
rings=d['rings']; sEnd=d['sEnd']; xp=np.array(d['xpath']); ks=np.arange(len(xp))*4
tr=np.array(T['trees'])
L=1000; parts=int(np.ceil((sEnd+30)/L))
for fig_i in range(0,parts,3):
    fig,axs=plt.subplots(1,3,figsize=(16,19))
    for j,ax in enumerate(axs):
        pi=fig_i+j
        if pi>=parts: ax.axis('off'); continue
        a,b=pi*L-20,(pi+1)*L
        m=(S>=a)&(S<=b)
        ax.imshow(shade[m],cmap='gray',origin='upper',extent=[-91,91,S[m][-1],S[m][0]],aspect='auto',vmin=0.05,vmax=1.05,alpha=0.9)
        # relief tint: hollows blue, mounds warm
        ax.imshow(np.clip(rel[m]/6,-1,1),cmap='coolwarm',origin='upper',extent=[-91,91,S[m][-1],S[m][0]],aspect='auto',alpha=0.18,vmin=-1,vmax=1)
        hw=np.array([r['hw'] for r in G])[m]; ax.plot(-hw,S[m],color='#1f5fbf',lw=1.2); ax.plot(hw,S[m],color='#1f5fbf',lw=1.2)
        # lanes
        for r in G:
            if not(a<=r['s']<=b) or int(r['s'])%4: continue
            for k,u,w in r['w']:
                ax.plot([u-w,u+w],[r['s'],r['s']],color='#3fa7d6' if k=='g' else '#d9a441',lw=1.6,alpha=0.55,solid_capstyle='butt')
            if r['gul']>0.6: ax.plot(r['goff'],r['s'],'.',color='#1f5fbf',ms=2)
            if r['mog']>0.5: ax.plot([-r['hw']*0.8,r['hw']*0.8],[r['s'],r['s']],color='#7a4fbf',lw=0.6,alpha=0.35)
        # trees as crowns
        t=tr[(tr[:,1]>=a)&(tr[:,1]<=b)]
        if len(t): ax.add_collection(PatchCollection([Circle((x-cxat(s),s),max(1.6,r*2.2)) for x,s,r in t],facecolor='#1e4d2b',edgecolor='none',alpha=0.85))
        mk=(ks>=a)&(ks<=b); ax.plot(xp[mk],ks[mk],color='#ff7a1a',lw=2.2,alpha=0.95)
        for i,q in enumerate(rings):
            if not(a<=q['s']<=b): continue
            x=q['x']-cxat(q['s']); ax.add_patch(Circle((x,q['s']),max(q['r'],1.4)*1.6,fill=False,edgecolor='#ffffff',lw=2.4)); ax.add_patch(Circle((x,q['s']),max(q['r'],1.4)*1.6,fill=False,edgecolor='#e0361b',lw=1.4))
            ax.text(x+4.5,q['s']+1.5,str(i+1),fontsize=7,color='#b0200b',fontweight='bold')
        for g in segs:
            if a<=g['s0']<=b: ax.axhline(g['s0'],color='#333',lw=0.8,ls='--'); ax.text(-88,g['s0']+10,NAME.get(g['type'],g['type']),fontsize=11,color='#111',bbox=dict(facecolor='white',alpha=0.75,lw=0))
        ax.set_xlim(-90,90); ax.set_ylim(b,a); ax.set_xlabel('横向 m（0 = 主道中线）'); ax.set_title(f'{max(0,a)}–{b} m',fontsize=11)
        if j==0: ax.set_ylabel('沿坡向下 m')
    h=[plt.Line2D([],[],color='#1f5fbf',label='主道边界'),plt.Line2D([],[],color='#3fa7d6',lw=6,alpha=0.55,label='林间雪槽'),plt.Line2D([],[],color='#d9a441',lw=6,alpha=0.55,label='林间小道'),
       plt.Line2D([],[],marker='o',ls='',color='#1e4d2b',label='树'),plt.Line2D([],[],color='#ff7a1a',lw=2.2,label='越野线路线'),plt.Line2D([],[],marker='o',ls='',mfc='none',mec='#e0361b',label='光圈（序号）')]
    fig.legend(handles=h,loc='upper center',bbox_to_anchor=(0.5,0.968),ncol=7,fontsize=11,frameon=False)
    fig.suptitle('越野线 · 标准 · 全程平面图（%d 个圈）  底图：地形明暗，蓝 = 低洼/槽，红 = 隆起'%len(rings),y=0.993,fontsize=13)
    plt.tight_layout(rect=[0,0,1,0.95]); plt.savefig(out%(fig_i//3+1),dpi=110); plt.close(fig)
