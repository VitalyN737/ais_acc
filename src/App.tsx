/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Music, 
  Calendar, 
  PlayCircle, 
  Award, 
  Share2, 
  Camera, 
  Film, 
  MapPin, 
  ArrowRight, 
  Mail, 
  Rss,
  Theater,
  Disc,
  User,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Play,
  Menu,
  X
} from "lucide-react";
import { HashRouter, Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import React, { useState, useEffect, createContext, useContext } from "react";
import Markdown from "react-markdown";
import { fetchJson, fetchCollection } from "./services/dataService";

// Initial placeholders to prevent crashes before fetch
const initialHome = { hero: { welcomeText: "", firstName: "", lastName: "", description: "", image: "", operaticRolesCount: "" } };
const initialProfile = { name: "", bio: [], experience: 0, performances: 0, image: "" };
const initialContact = { title: "", description: "", management: { name: "", location: "", email: "" } };
const initialFooter = { copyright: "", links: [] };

const DataContext = createContext<any>(null);

const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    // Fallback for components rendered outside the provider (shouldn't happen with current structure)
    return {
      homeData: initialHome,
      profileData: initialProfile,
      contactData: initialContact,
      footerData: initialFooter,
      news: [],
      performances: [],
      galleryItems: [],
      mediaItems: [],
      repertoireItems: [],
      cds: []
    };
  }
  return context;
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const { homeData, performances, news } = useData();
  return (
    <PageWrapper>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10">
      <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
        <div className="flex flex-col gap-2">
          <span className="text-slate-400 font-bold tracking-[0.3em] uppercase text-sm">{homeData.hero.welcomeText}</span>
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter">
            {homeData.hero.firstName} <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{homeData.hero.lastName}</span>
          </h1>
        </div>
        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
          {homeData.hero.description}
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <Link to="/schedule" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/40 hover:-translate-y-1 transition-all group">
            View Schedule
            <Calendar className="size-5 group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/media" className="flex items-center gap-2 px-8 py-4 rounded-xl glass text-slate-100 font-bold text-lg hover:bg-white/10 transition-all group">
            Watch Media
            <PlayCircle className="size-5 group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        <div className="flex gap-4 mt-6">
          {[Award, Share2, Camera, Film].map((Icon, idx) => (
            <a key={idx} href="#" className="size-12 rounded-full glass flex items-center justify-center hover:text-primary hover:bg-white/5 transition-all">
              <Icon className="size-5" />
            </a>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-75"></div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass p-3">
            <div className="w-full h-full rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url('${homeData.hero.image}')` }}></div>
          </div>
          <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl border border-white/10 shadow-xl hidden md:block">
            <div className="flex flex-col">
              <span className="text-primary font-bold text-2xl">{homeData.hero.operaticRolesCount}</span>
              <span className="text-xs uppercase tracking-widest text-slate-400">Operatic Roles</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mt-20">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-bold tracking-tight">Upcoming Performances</h2>
        <Link to="/schedule" className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group">
          Full Schedule <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {performances.slice(0, 2).map((perf, idx) => (
          <Link key={idx} to={`/schedule/${perf.id}`}>
            <motion.div 
              whileHover={{ x: 10 }}
              className="flex items-center gap-6 p-6 glass-card rounded-2xl border border-white/5 hover:bg-white/5 transition-all group"
            >
              <div className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[70px] ${perf.active ? 'bg-primary text-white' : 'glass text-white border border-white/10'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">{perf.month}</span>
                <span className="text-2xl font-black">{perf.day}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{perf.title}</h4>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <MapPin className="size-3 text-primary" />
                  {perf.location}
                </p>
              </div>
              <div className="hidden md:flex gap-4">
                <button className="px-6 py-2 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm">
                  Book Tickets
                </button>
                <div className="size-10 rounded-xl glass flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <ArrowRight className="size-5" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>

    <section className="mt-20">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-bold tracking-tight">Latest News</h2>
        <Link to="/news" className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group">
          View All <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((item, idx) => (
          <Link key={idx} to={`/news/${item.id}`}>
            <motion.div whileHover={{ y: -5 }} className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/50 transition-all h-full">
              <div className="h-48 bg-cover bg-center overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${item.image}')` }}></div>
                <div className="absolute inset-0 bg-[#0A141F]/40 group-hover:bg-[#0A141F]/20 transition-all"></div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">{item.category}</span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  </PageWrapper>
  );
};

const Schedule = () => {
  const { performances } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Performance Schedule</h2>
      <div className="flex flex-col gap-6">
        {performances.map((perf, idx) => (
          <Link key={idx} to={`/schedule/${perf.id}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between p-8 glass-card rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-8">
                <div className={`flex flex-col items-center justify-center p-4 rounded-2xl min-w-[90px] ${perf.active ? 'bg-primary text-white' : 'glass-card text-white border border-white/20'}`}>
                  <span className="text-sm font-bold uppercase">{perf.month}</span>
                  <span className="text-3xl font-black">{perf.day}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-2xl font-bold group-hover:text-primary transition-colors">{perf.title}</h4>
                  <p className="text-slate-400 flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {perf.location}
                  </p>
                  <span className="text-xs text-primary font-bold uppercase tracking-widest mt-2">Opera in 3 Acts</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex gap-4">
                <button className="px-8 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                  Book Tickets
                </button>
                <div className="px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all">
                  <Share2 className="size-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </PageWrapper>
  );
};

const News = () => {
  const { news } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Latest News & Updates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item, idx) => (
          <Link key={idx} to={`/news/${item.id}`}>
            <div className="glass-card rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/50 transition-all h-full">
              <div className="h-64 bg-cover bg-center overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${item.image}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A141F] to-transparent opacity-60"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{item.category}</span>
                  <span className="text-xs text-slate-500">Oct 24, 2024</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{item.description}</p>
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest group/btn">
                  Read Full Story <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </PageWrapper>
  );
};

const Profile = () => {
  const { profileData } = useData();
  return (
    <PageWrapper>
      <div className="py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-2 block">Biography</span>
          <h2 className="text-5xl font-black tracking-tight mb-6">{profileData.name}</h2>
          <div className="flex flex-col gap-6 text-lg text-slate-300 leading-relaxed">
            {profileData.bio.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-6 rounded-2xl">
            <span className="text-primary font-bold text-3xl block mb-1">{profileData.experience}+</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Years of Experience</span>
          </div>
          <div className="glass p-6 rounded-2xl">
            <span className="text-primary font-bold text-3xl block mb-1">{profileData.performances}+</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Performances</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90"></div>
        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 glass p-4">
          <img 
            src={profileData.image} 
            alt={`${profileData.name} Profile`} 
            className="w-full rounded-[2rem] grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </div>
  </PageWrapper>
  );
};

const Gallery = () => {
  const { galleryItems } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <Link key={item.id} to={`/gallery/${item.id}`}>
            <div className="aspect-square glass-card rounded-2xl overflow-hidden group cursor-pointer relative">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white size-8" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </PageWrapper>
  );
};

const Media = () => {
  const { mediaItems } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Media & Recordings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Video className="text-primary" /> Featured Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {mediaItems.filter(m => m.type === "video").map(video => (
              <Link key={video.id} to={`/media/${video.id}`}>
              <div className="aspect-video glass rounded-[2rem] overflow-hidden relative group cursor-pointer border border-white/10">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${video.image}')` }}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 group-hover:backdrop-blur-[2px] transition-all flex items-center justify-center">
                  <div className="size-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-white/20">
                    <PlayCircle className="size-10" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{video.title}</h4>
                  <p className="text-sm text-slate-300">{video.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Music className="text-primary" /> Audio Clips
          </h3>
          <div className="flex flex-col gap-4">
            {mediaItems.filter(m => m.type === "audio").map((track) => (
              <Link key={track.id} to={`/media/${track.id}`}>
                <div className="glass p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 hover:border-primary/30 transition-all border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-lg shadow-primary/0 group-hover:shadow-primary/20">
                      <PlayCircle className="size-6 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">{track.title}</span>
                      <span className="text-xs text-slate-500 uppercase tracking-widest">{track.subtitle || "Audio Recording"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <span className="text-sm text-slate-400 font-mono bg-white/5 px-3 py-1 rounded-full">{track.duration}</span>
                    <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
  );
};

const CD = () => {
  const { cds } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Discography</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {cds.filter(cd => cd.featured).map(cd => (
          <Link key={cd.id} to={`/cd/${cd.id}`} className="block">
            <div className="glass-card p-10 rounded-[3rem] border border-white/10 flex flex-col md:flex-row gap-10 items-center hover:bg-white/5 transition-all group">
              <div className="w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
                <img 
                  src={cd.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={cd.title}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Disc className="text-white size-12 animate-spin-slow" />
                </div>
              </div>
              <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
                <span className="text-primary font-bold uppercase tracking-widest text-xs">Latest Release</span>
                <h3 className="text-3xl font-black group-hover:text-primary transition-colors">{cd.title}</h3>
                <p className="text-slate-400">{cd.description}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <div className="px-6 py-2 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    Buy CD <ExternalLink className="size-3" />
                  </div>
                  <div className="px-6 py-2 rounded-lg glass text-xs font-bold uppercase tracking-widest">
                    Stream
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        <div className="grid grid-cols-1 gap-6">
          {cds.filter(cd => !cd.featured).map((album) => (
            <Link key={album.id} to={`/cd/${album.id}`}>
              <div className="glass p-6 rounded-2xl flex items-center gap-6 border border-white/5 hover:bg-white/5 transition-all group">
                <div className="size-20 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={album.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={album.title} />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{album.title}</h4>
                  <span className="text-sm text-slate-500">{album.year}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </PageWrapper>
  );
};

const Repertoire = () => {
  const { repertoireItems } = useData();
  return (
    <PageWrapper>
      <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Repertoire</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Theater className="size-6" /> Operatic Roles
          </h3>
          <div className="flex flex-col gap-4">
            {repertoireItems.filter(i => i.type === "opera").map((item) => (
              <Link key={item.id} to={`/repertoire/${item.id}`}>
                <div className="glass p-5 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/5 transition-all group">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{item.composer}</span>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{item.role}</h4>
                  </div>
                  <span className="text-sm italic text-primary">{item.opera}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Music className="size-6" /> Concert & Oratorio
          </h3>
          <div className="flex flex-col gap-4">
            {repertoireItems.filter(i => i.type === "concert").map((item) => (
              <Link key={item.id} to={`/repertoire/${item.id}`}>
                <div className="glass p-5 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/5 transition-all group">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{item.composer}</span>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{item.work}</h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
  );
};

const Contact = () => {
  const { contactData } = useData();
  return (
    <PageWrapper>
      <div className="py-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-2 block">Get in Touch</span>
          <h2 className="text-5xl font-black tracking-tight mb-6">{contactData.title}</h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            {contactData.description}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-primary size-5" /> General Management
            </h3>
            <div className="flex flex-col gap-2 text-slate-300">
              <p className="font-bold text-white">{contactData.management.name}</p>
              <p>{contactData.management.location}</p>
              <a href={`mailto:${contactData.management.email}`} className="text-primary hover:underline">{contactData.management.email}</a>
            </div>
          </div>

          <div className="flex gap-4">
            <a href="#" className="size-14 rounded-2xl glass flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary">
              <Mail className="size-6" />
            </a>
            <a href="#" className="size-14 rounded-2xl glass flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary">
              <Share2 className="size-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Name</label>
              <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="Your Name" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Email</label>
              <input type="email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="your@email.com" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Subject</label>
            <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="Performance Inquiry" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Message</label>
            <textarea rows={5} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all resize-none" placeholder="Your message here..."></textarea>
          </div>
          <button className="bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </PageWrapper>
  );
};

const NewsDetail = () => {
  const { id } = useParams();
  const { news } = useData();
  const item = news.find((n: any) => n.id === id);

  if (!item) return <div className="py-20 text-center">News not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-4xl mx-auto">
        <Link to="/news" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to News
        </Link>
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10">
          <div className="h-[400px] bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }}></div>
          <div className="p-10 md:p-16">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">{item.category}</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">{item.title}</h1>
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/5">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="text-primary size-6" />
              </div>
              <div>
                <p className="font-bold">Vitaly Yushmanov</p>
                <p className="text-xs text-slate-500">Oct 24, 2024 • 5 min read</p>
              </div>
            </div>
            <div className="text-lg text-slate-300 leading-relaxed space-y-6">
              <p className="text-xl text-white font-medium italic">{item.description}</p>
              <div className="markdown-body">
                <Markdown>{item.body}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const PerformanceDetail = () => {
  const { id } = useParams();
  const { performances } = useData();
  const perf = performances.find((p: any) => p.id === id);

  if (!perf) return <div className="py-20 text-center">Performance not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-4xl mx-auto">
        <Link to="/schedule" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to Schedule
        </Link>
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 p-10 md:p-16">
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-12">
            <div className={`flex flex-col items-center justify-center p-6 rounded-3xl min-w-[120px] ${perf.active ? 'bg-primary text-white' : 'glass-card text-white border border-white/20'}`}>
              <span className="text-lg font-bold uppercase">{perf.month}</span>
              <span className="text-5xl font-black">{perf.day}</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{perf.title}</h1>
              <p className="text-xl text-slate-400 flex items-center gap-3">
                <MapPin className="size-6 text-primary" />
                {perf.location}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold border-b border-white/5 pb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="font-bold">19:00 JST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold">2h 30m (with intermission)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Language</span>
                  <span className="font-bold">Italian with Japanese subtitles</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold border-b border-white/5 pb-4">Tickets</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">S Seat</span>
                  <span className="font-bold">¥12,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">A Seat</span>
                  <span className="font-bold">¥8,000</span>
                </div>
                <button className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all mt-4">
                  Book Now
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold border-b border-white/5 pb-4">About the Performance</h3>
            <div className="text-slate-300 leading-relaxed markdown-body">
              <Markdown>{perf.body}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const CDDetail = () => {
  const { id } = useParams();
  const { cds } = useData();
  const cd = cds.find((c: any) => c.id === id);

  if (!cd) return <div className="py-20 text-center">Album not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-4xl mx-auto">
        <Link to="/cd" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to Discography
        </Link>
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 p-10 md:p-16">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
            <div className="w-72 aspect-square rounded-3xl overflow-hidden shadow-2xl relative group">
              <img src={cd.image} className="w-full h-full object-cover" alt={cd.title} />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc className="text-white/50 size-20 animate-spin-slow" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">{cd.year} Release</span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">{cd.title}</h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">{cd.description}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-2">
                  Buy Physical CD <ExternalLink className="size-4" />
                </button>
                <button className="px-10 py-4 glass text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                  Stream Now
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-3xl font-bold border-b border-white/5 pb-6 mb-6">About the Album</h3>
              <div className="text-slate-300 leading-relaxed markdown-body">
                <Markdown>{cd.body}</Markdown>
              </div>
            </section>

            {cd.tracks && cd.tracks.length > 0 && (
              <section>
                <h3 className="text-3xl font-bold border-b border-white/5 pb-6 mb-8">Tracklist</h3>
                <div className="space-y-4">
                  {cd.tracks.map((track: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-6">
                        <span className="text-slate-600 font-mono w-6 text-lg">{idx + 1}</span>
                        <span className="font-bold text-xl group-hover:text-primary transition-colors">{track}</span>
                      </div>
                      <div className="size-10 rounded-full glass flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <Play className="size-4 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const GalleryDetail = () => {
  const { id } = useParams();
  const { galleryItems } = useData();
  const item = galleryItems.find((g: any) => g.id === id);

  if (!item) return <div className="py-20 text-center">Image not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-5xl mx-auto">
        <Link to="/gallery" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to Gallery
        </Link>
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10">
          <div className="aspect-square md:aspect-video bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }}></div>
          <div className="p-10 md:p-16">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">{item.title}</h1>
            <p className="text-xl text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const MediaDetail = () => {
  const { id } = useParams();
  const { mediaItems } = useData();
  const item = mediaItems.find((m: any) => m.id === id);

  if (!item) return <div className="py-20 text-center">Media not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-5xl mx-auto">
        <Link to="/media" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to Media
        </Link>
        <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10">
          {item.type === "video" ? (
            <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
              {item.videoUrl ? (
                <iframe
                  src={item.videoUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('${item.image}')` }}></div>
                  <div className="size-24 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl relative z-10">
                    <PlayCircle className="size-12" />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-primary/20 to-blue-900/20 flex items-center justify-center">
              <Music className="text-primary size-32 opacity-20" />
            </div>
          )}
          <div className="p-10 md:p-16">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">{item.type}</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{item.title}</h1>
            {item.subtitle && <p className="text-xl text-slate-400 mb-8">{item.subtitle}</p>}
            {item.duration && <p className="text-slate-500 font-mono mb-8">Duration: {item.duration}</p>}
            
            <div className="text-slate-300 leading-relaxed markdown-body mb-10">
              <Markdown>{item.body}</Markdown>
            </div>

            {item.type === "audio" && (
              <div className="p-8 glass rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold uppercase tracking-widest">Now Playing</span>
                </div>
                {item.audioUrl && (
                  <audio controls className="w-full mb-6 accent-primary">
                    <source src={item.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
                  <span>01:24</span>
                  <span>{item.duration || "05:00"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const RepertoireDetail = () => {
  const { id } = useParams();
  const { repertoireItems } = useData();
  const item = repertoireItems.find((r: any) => r.id === id);

  if (!item) return <div className="py-20 text-center">Repertoire item not found</div>;

  return (
    <PageWrapper>
      <div className="py-10 max-w-4xl mx-auto">
        <Link to="/repertoire" className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest mb-8 hover:-translate-x-1 transition-transform inline-flex">
          <ArrowRight className="size-4 rotate-180" /> Back to Repertoire
        </Link>
        <div className="glass-card rounded-[3rem] p-10 md:p-16 border border-white/10">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">{item.composer}</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            {item.type === "opera" ? item.role : item.work}
          </h1>
          {item.opera && <p className="text-2xl italic text-slate-400 mb-10">from {item.opera}</p>}
          
          <div className="space-y-12">
            <section>
              <h3 className="text-2xl font-bold border-b border-white/5 pb-4 mb-6">About the Role</h3>
              <div className="text-lg text-slate-300 leading-relaxed markdown-body">
                <Markdown>{item.body}</Markdown>
              </div>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-2xl border border-white/5">
                <h4 className="font-bold mb-2">First Performance</h4>
                <p className="text-slate-400">Tokyo Bunka Kaikan, 2016</p>
              </div>
              <div className="glass p-8 rounded-2xl border border-white/5">
                <h4 className="font-bold mb-2">Notable Production</h4>
                <p className="text-slate-400">European Tour, 2021</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { footerData, refreshData } = useData();

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    if (isMenuOpen) {
      root.style.overflow = 'hidden';
    } else {
      root.style.overflow = '';
    }

    return () => {
      root.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { name: "Schedule", path: "/schedule" },
    { name: "News", path: "/news" },
    { name: "Profile", path: "/profile" },
    { name: "Gallery", path: "/gallery" },
    { name: "Media", path: "/media" },
    { name: "CD", path: "/cd" }
  ];
  
  return (
    <div className="relative gradient-bg selection:bg-primary selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="layout-container flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between glass mx-4 mt-4 rounded-xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="text-primary">
              <Music className="size-8" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-black leading-none tracking-tight uppercase">VITALY YUSHMANOV</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold">Baritone</span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-primary' : 'hover:text-primary'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={refreshData}
              className="hidden md:flex items-center justify-center size-10 rounded-lg glass hover:bg-white/10 transition-all text-slate-400 hover:text-primary"
              title="Refresh Content"
            >
              <Rss className="size-4" />
            </button>
            <div className="hidden lg:flex gap-3">
              <Link 
                to="/repertoire" 
                className={`flex items-center justify-center px-5 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${location.pathname === '/repertoire' ? 'bg-white text-primary border-white' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}`}
              >
                Repertoire
              </Link>
              <Link 
                to="/contact" 
                className={`flex items-center justify-center px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer ${location.pathname === '/contact' ? 'bg-white text-primary' : 'bg-primary text-white shadow-primary/40 hover:scale-105'}`}
              >
                Contact
              </Link>
            </div>
            
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden size-10 flex items-center justify-center rounded-lg glass hover:bg-white/10 transition-all text-white"
            >
              {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-40 lg:hidden bg-[#0A141F]/95 backdrop-blur-xl flex flex-col p-8 pt-24"
            >
              <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`text-2xl font-black tracking-tight transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-white hover:text-primary'}`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="h-px bg-white/10 my-4"></div>
                <Link 
                  to="/repertoire" 
                  className={`text-2xl font-black tracking-tight transition-colors ${location.pathname === '/repertoire' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  Repertoire
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-2xl font-black tracking-tight transition-colors ${location.pathname === '/contact' ? 'text-primary' : 'text-white hover:text-primary'}`}
                >
                  Contact
                </Link>
              </nav>

              <div className="mt-auto flex gap-6">
                <a href="#" className="size-12 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                  <Mail className="size-6" />
                </a>
                <a href="#" className="size-12 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                  <Rss className="size-6" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 px-6 max-w-7xl mx-auto w-full pt-8 pb-20">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto px-6 py-12 glass border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <Music className="size-6 text-primary" />
                <h2 className="text-lg font-black tracking-tight uppercase">Vitaly Yushmanov</h2>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">{footerData.copyright}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400">
              {footerData.links.map((link) => (
                <a key={link} href="#" className="hover:text-primary transition-colors">{link}</a>
              ))}
            </div>

            <div className="flex gap-4">
              <Link to="/contact" className="size-10 rounded-lg glass-card flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary">
                <Mail className="size-4" />
              </Link>
              <a href="#" className="size-10 rounded-lg glass-card flex items-center justify-center hover:bg-primary/20 transition-all text-slate-400 hover:text-primary">
                <Rss className="size-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  const [homeData, setHomeData] = useState(initialHome);
  const [profileData, setProfileData] = useState(initialProfile);
  const [contactData, setContactData] = useState(initialContact);
  const [footerData, setFooterData] = useState(initialFooter);
  const [news, setNews] = useState<any[]>([]);
  const [performances, setPerformances] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [repertoireItems, setRepertoireItems] = useState<any[]>([]);
  const [cds, setCds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      console.log(`Fetching data with timestamp: ${timestamp}`);
      const [
        home, profile, contact, footer,
        newsData, perfData, galleryData, mediaData, repData, cdsData
      ] = await Promise.all([
        fetchJson('home.json'),
        fetchJson('profile.json'),
        fetchJson('contact.json'),
        fetchJson('footer.json'),
        fetchCollection('news'),
        fetchCollection('performances'),
        fetchCollection('gallery'),
        fetchCollection('media'),
        fetchCollection('repertoire'),
        fetchCollection('cds')
      ]);

      console.log("Data fetched successfully:", { home, profile });
      setHomeData(home);
      setProfileData(profile);
      setContactData(contact);
      setFooterData(footer);
      setNews(newsData);
      setPerformances(perfData);
      setGalleryItems(galleryData);
      setMediaItems(mediaData);
      setRepertoireItems(repData);
      setCds(cdsData);
    } catch (error) {
      console.error("Error loading live data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  if (loading && refreshKey === 0) {
    return (
      <div className="min-h-screen bg-[#0A141F] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Live Content...</p>
        </div>
      </div>
    );
  }

  const dataValue = {
    homeData, profileData, contactData, footerData,
    news, performances, galleryItems, mediaItems, repertoireItems, cds,
    refreshData: () => setRefreshKey(prev => prev + 1)
  };

  return (
    <DataContext.Provider value={dataValue}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:id" element={<PerformanceDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:id" element={<GalleryDetail />} />
            <Route path="/media" element={<Media />} />
            <Route path="/media/:id" element={<MediaDetail />} />
            <Route path="/cd" element={<CD />} />
            <Route path="/cd/:id" element={<CDDetail />} />
            <Route path="/repertoire" element={<Repertoire />} />
            <Route path="/repertoire/:id" element={<RepertoireDetail />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataContext.Provider>
  );
}
