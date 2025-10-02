import json
import os
from datetime import datetime

class DataManager:
    def __init__(self):
        self.data_dir = 'data'
        self.candidates_file = os.path.join(self.data_dir, 'candidates.json')
        self.votes_file = os.path.join(self.data_dir, 'votes.json')
        self.config_file = os.path.join(self.data_dir, 'config.json')
        self.voters_file = os.path.join(self.data_dir, 'voters.json')
        
        os.makedirs(self.data_dir, exist_ok=True)
        self._initialize_files()
    
    def _initialize_files(self):
        if not os.path.exists(self.candidates_file):
            self._save_json(self.candidates_file, [])
        
        if not os.path.exists(self.votes_file):
            self._save_json(self.votes_file, {})
        
        if not os.path.exists(self.config_file):
            self._save_json(self.config_file, {
                'voting_end_date': None,
                'voting_active': False
            })
        
        if not os.path.exists(self.voters_file):
            self._save_json(self.voters_file, [])
    
    def _load_json(self, filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return [] if 'candidates' in filepath or 'voters' in filepath else {}
    
    def _save_json(self, filepath, data):
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def get_candidates(self):
        return self._load_json(self.candidates_file)
    
    def save_candidates(self, candidates):
        self._save_json(self.candidates_file, candidates)
    
    def add_candidate(self, candidate):
        candidates = self.get_candidates()
        candidate['id'] = len(candidates) + 1
        candidate['photo'] = candidate.get('photo', 'default_avatar.png')
        candidates.append(candidate)
        self.save_candidates(candidates)
        return candidate
    
    def update_candidate(self, candidate_id, updated_data):
        candidates = self.get_candidates()
        for candidate in candidates:
            if candidate['id'] == candidate_id:
                candidate.update(updated_data)
                break
        self.save_candidates(candidates)
    
    def delete_candidate(self, candidate_id):
        candidates = self.get_candidates()
        candidates = [c for c in candidates if c['id'] != candidate_id]
        self.save_candidates(candidates)
    
    def get_votes(self):
        votes = self._load_json(self.votes_file)
        return votes if isinstance(votes, dict) else {}
    
    def add_vote(self, candidate_id):
        votes = self.get_votes()
        candidate_id_str = str(candidate_id)
        votes[candidate_id_str] = votes.get(candidate_id_str, 0) + 1
        self._save_json(self.votes_file, votes)
    
    def get_vote_count(self, candidate_id):
        votes = self.get_votes()
        return votes.get(str(candidate_id), 0)
    
    def get_voters(self):
        return self._load_json(self.voters_file)
    
    def add_voter(self, email, candidate_id):
        voters = self.get_voters()
        candidates = self.get_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)
        
        if not candidate:
            return False
        
        categoria = candidate.get('categoria', '')
        is_leader = 'Líder' in categoria
        
        email_lower = email.lower()
        voter_entry = next((v for v in voters if v['email'] == email_lower), None)
        
        if not voter_entry:
            voters.append({
                'email': email_lower,
                'voted_professional': not is_leader,
                'voted_leader': is_leader
            })
            self._save_json(self.voters_file, voters)
            return True
        else:
            if is_leader and not voter_entry.get('voted_leader', False):
                voter_entry['voted_leader'] = True
                self._save_json(self.voters_file, voters)
                return True
            elif not is_leader and not voter_entry.get('voted_professional', False):
                voter_entry['voted_professional'] = True
                self._save_json(self.voters_file, voters)
                return True
            
        return False
    
    def has_voted(self, email, candidate_id):
        voters = self.get_voters()
        candidates = self.get_candidates()
        candidate = next((c for c in candidates if c['id'] == candidate_id), None)
        
        if not candidate:
            return True
        
        categoria = candidate.get('categoria', '')
        is_leader = 'Líder' in categoria
        
        email_lower = email.lower()
        voter_entry = next((v for v in voters if isinstance(v, dict) and v.get('email') == email_lower), None)
        
        if not voter_entry:
            return False
        
        if is_leader:
            return voter_entry.get('voted_leader', False)
        else:
            return voter_entry.get('voted_professional', False)
    
    def get_config(self):
        return self._load_json(self.config_file)
    
    def save_config(self, config):
        self._save_json(self.config_file, config)
    
    def is_voting_active(self):
        config = self.get_config()
        if not config.get('voting_active', False):
            return False
        
        end_date_str = config.get('voting_end_date')
        if not end_date_str:
            return False
        
        try:
            end_date = datetime.fromisoformat(end_date_str)
            return datetime.now() < end_date
        except:
            return False
    
    def get_results(self):
        candidates = self.get_candidates()
        votes = self.get_votes()
        
        for candidate in candidates:
            candidate['vote_count'] = votes.get(str(candidate['id']), 0)
        
        professional = [c for c in candidates if 'Líder' not in c.get('categoria', '')]
        leader = [c for c in candidates if 'Líder' in c.get('categoria', '')]
        
        # Para resultados, manter ordenação por votos
        professional.sort(key=lambda x: x['vote_count'], reverse=True)
        leader.sort(key=lambda x: x['vote_count'], reverse=True)
        
        # Para exibição geral, criar listas ordenadas alfabeticamente
        professional_alpha = sorted(professional, key=lambda x: x['nome'])
        leader_alpha = sorted(leader, key=lambda x: x['nome'])
        
        if len(professional) >= 4 and len(leader) >= 1:
            top_professional = professional[:4]
            top_leader = leader[:1]
            
            remaining_professional = professional[4:] if len(professional) > 4 else []
            remaining_leader = leader[1:] if len(leader) > 1 else []
            
            remaining_all = remaining_professional + remaining_leader
            remaining_all.sort(key=lambda x: x['vote_count'], reverse=True)
            
            if remaining_all:
                fifth = remaining_all[0]
                if 'Líder' in fifth.get('categoria', ''):
                    top_leader.append(fifth)
                else:
                    top_professional.append(fifth)
            
            top_5 = top_professional + top_leader
        elif len(professional) >= 3 and len(leader) >= 2:
            top_professional = professional[:3]
            top_leader = leader[:2]
            top_5 = top_professional + top_leader
        else:
            all_candidates = professional + leader
            all_candidates.sort(key=lambda x: x['vote_count'], reverse=True)
            top_5 = all_candidates[:5]
        
        return {
            'top_5': top_5,
            'all_candidates': candidates,
            'professional': professional,
            'leader': leader,
            'professional_alpha': professional_alpha,
            'leader_alpha': leader_alpha
        }
    
    def reset_voting(self):
        self._save_json(self.votes_file, {})
        self._save_json(self.voters_file, [])
    
    def delete_all_candidates(self):
        self._save_json(self.candidates_file, [])
        self._save_json(self.votes_file, {})
        self._save_json(self.voters_file, [])
