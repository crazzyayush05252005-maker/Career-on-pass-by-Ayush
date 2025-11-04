import React, { useState, useCallback } from 'react';
import { Flow, SubjectStream10, SubjectStream12, CareerOption, College, StudentProfile, AssessmentQuestion, AssessmentResult, JobMarketAnalysisResult } from './types';
import * as geminiService from './services/geminiService';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';

const commonInterests = ["Physics", "Mathematics", "Computer Science", "Biology", "Chemistry", "History", "Literature", "Art & Design", "Economics", "Music"];

const App: React.FC = () => {
    const [flow, setFlow] = useState<Flow>(Flow.Landing);
    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for data
    const [selectedSubject10, setSelectedSubject10] = useState<SubjectStream10 | null>(null);
    const [selectedSubject12, setSelectedSubject12] = useState<SubjectStream12 | null>(null);
    const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<string[]>([]);
    const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [pathway, setPathway] = useState<string>('');
    const [studentProfile, setStudentProfile] = useState<StudentProfile>({ marks10: '', marks12: '', achievements: '' });
    const [colleges, setColleges] = useState<College[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<string|null>(null);

    // State for Assessment
    const [assessmentType, setAssessmentType] = useState<'interest' | 'hots' | null>(null);
    const [assessmentInterests, setAssessmentInterests] = useState<string[]>([]);
    const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: number]: string }>({});
    const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

    // State for new features
    const [jobMarketQuery, setJobMarketQuery] = useState('');
    const [jobMarketResult, setJobMarketResult] = useState<JobMarketAnalysisResult | null>(null);
    const [expertFormSubmitted, setExpertFormSubmitted] = useState(false);


    const handleApiCall = useCallback(async <T,>(apiFunc: () => Promise<T>, onSuccess: (data: T) => void, loadingMessage?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiFunc();
            onSuccess(data);
        } catch (e) {
            console.error(e);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetState = () => {
        setFlow(Flow.Landing);
        setStep(1);
        setError(null);
        setSelectedSubject10(null);
        setSelectedSubject12(null);
        setCareerOptions([]);
        setCourseOptions([]);
        setSelectedCareer(null);
        setSelectedCourse(null);
        setPathway('');
        setStudentProfile({ marks10: '', marks12: '', achievements: '' });
        setColleges([]);
        setSelectedCollege(null);
        setAssessmentType(null);
        setAssessmentInterests([]);
        setAssessmentQuestions([]);
        setCurrentQuestionIndex(0);
        setAssessmentAnswers({});
        setAssessmentResult(null);
        setJobMarketQuery('');
        setJobMarketResult(null);
        setExpertFormSubmitted(false);
    };

    const handleBack = () => {
        if (flow === Flow.SkillsAssessment && (step === 1.5 || step === 2)) {
             setStep(1); // Go back to assessment choice from interest selection or first question
             setCurrentQuestionIndex(0);
             setAssessmentAnswers({});
             setAssessmentQuestions([]);
        } else if (step > 1) {
            setStep(step - 1);
        } else if (flow !== Flow.Landing) {
            setFlow(Flow.Landing);
            setJobMarketResult(null);
            setJobMarketQuery('');
            setExpertFormSubmitted(false);
        } else {
            resetState();
        }
    };

    // --- After 10th Flow Handlers ---
    const handleSelectSubject10 = (subject: SubjectStream10) => {
        setSelectedSubject10(subject);
        handleApiCall(() => geminiService.getCareerOptions10(subject), (data) => {
            setCareerOptions(data);
            setFlow(Flow.AfterTen);
            setStep(2);
        });
    };

    const handleSelectCareer10 = (career: string, subject: SubjectStream10) => {
        setSelectedCareer(career);
        setSelectedSubject10(subject);
        handleApiCall(() => geminiService.getCareerPathway10(subject, career), (data) => {
            setPathway(data);
            setFlow(Flow.AfterTen);
            setStep(3);
        });
    };
    
    // --- After 12th Flow Handlers ---
    const handleSelectSubject12 = (subject: SubjectStream12) => {
        setSelectedSubject12(subject);
        handleApiCall(() => geminiService.getCourseOptions12(subject), (data) => {
            setCourseOptions(data);
            setFlow(Flow.AfterTwelve);
            setStep(2);
        });
    };
    
    const handleSelectCourse12 = (course: string) => {
        setSelectedCourse(course);
        setStep(3);
    };

    const handleFindColleges = () => setStep(4);
    
    const handleFindCareers = () => {
        handleApiCall(() => geminiService.getCareerOptions12(selectedCourse!), (data) => {
            setCareerOptions(data);
            setStep(7); // Jump to career list step
        });
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleApiCall(() => geminiService.getCollegeSuggestions(selectedCourse!, studentProfile), (data) => {
            setColleges(data);
            setStep(5);
        });
    };

    const handleSelectCollege = (collegeName: string) => {
        setSelectedCollege(collegeName);
        handleApiCall(() => geminiService.getAdmissionPathway(collegeName, selectedCourse!), (data) => {
            setPathway(data);
            setStep(6);
        });
    };

    const handleSelectCareer12 = (careerName: string) => {
        setSelectedCareer(careerName);
        handleApiCall(() => geminiService.getCareerPathway12(selectedCourse!, careerName), (data) => {
            setPathway(data);
            setStep(8); // Career pathway step for 12th
        });
    };

    // --- Skills Assessment Flow Handlers ---
    const handleStartAssessment = () => {
        setFlow(Flow.SkillsAssessment);
        setStep(1);
    };

    const handleInterestToggle = (interest: string) => {
        setAssessmentInterests(prev => 
            prev.includes(interest) 
                ? prev.filter(i => i !== interest) 
                : [...prev, interest]
        );
    };
    
    const handleStartHotsAssessment = () => {
        setAssessmentType('hots');
        handleApiCall(() => geminiService.getHotsAssessmentQuestions(), (data) => {
            setAssessmentQuestions(data);
            setStep(2);
        }, "Preparing some thought-provoking questions...");
    };

    const handleInterestsSubmit = () => {
        if (assessmentInterests.length === 0) {
            setError("Please select at least one interest.");
            return;
        }
        setAssessmentType('interest');
        handleApiCall(() => geminiService.getAssessmentQuestions(assessmentInterests), (data) => {
            setAssessmentQuestions(data);
            setStep(2);
        }, "Crafting your personalized quiz...");
    };

    const handleAnswerSubmit = (answer: string) => {
        const currentQuestion = assessmentQuestions[currentQuestionIndex];
        const newAnswers = { ...assessmentAnswers, [currentQuestion.id]: answer };
        setAssessmentAnswers(newAnswers);

        if (currentQuestionIndex < assessmentQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const apiFunc = assessmentType === 'hots'
                ? () => geminiService.analyzeHotsAssessmentResults(newAnswers)
                : () => geminiService.analyzeAssessmentResults(newAnswers);

            handleApiCall(apiFunc, (data) => {
                setAssessmentResult(data);
                setStep(3);
            }, 'Analyzing your unique thinking style...');
        }
    };

    // --- New Feature Handlers ---
    const handleJobMarketAnalysis = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobMarketQuery) return;
        handleApiCall(() => geminiService.getJobMarketAnalysis(jobMarketQuery), (data) => {
            setJobMarketResult(data);
        }, `Analyzing market for ${jobMarketQuery}...`);
    };

    const handleExpertFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setExpertFormSubmitted(true);
            setIsLoading(false);
        }, 1000);
    };


    const renderBackButton = () => (
        <Button onClick={handleBack} variant="secondary">← Back</Button>
    );
    
    const renderPathway = (title: string, subtitle: string) => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-indigo-400">{title}</h2>
                <p className="text-slate-400 mt-2">{subtitle}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 max-w-4xl mx-auto">
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-indigo-300 prose-ul:list-disc prose-li:marker:text-indigo-400 whitespace-pre-wrap font-sans" dangerouslySetInnerHTML={{ __html: pathway.replace(/\n/g, '<br />') }}/>
            </div>
            <div className="text-center">
                <Button onClick={resetState}>Start Over</Button>
            </div>
        </div>
    );
    
    const FeatureCard = ({ title, description, icon, onClick, className = '' }: { title: string, description: string, icon: string, onClick: () => void, className?: string }) => (
      <div
        onClick={onClick}
        className={`bg-slate-800/50 rounded-xl p-6 shadow-lg hover:shadow-indigo-500/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer border border-slate-700 hover:border-indigo-500 hover:-translate-y-1 ${className}`}
      >
        <div className="text-3xl mb-4 text-indigo-400">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    );


    const renderContent = () => {
        if (flow === Flow.Landing) {
            return (
                <div className="text-center animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Navigate Your Future</h1>
                    <p className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto">AI-powered guidance to help you discover the right career, college, and skills for a successful future.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <FeatureCard title="Guidance after 10th" description="Explore careers based on your subject choices." icon="🎓" onClick={() => setFlow(Flow.AfterTen)} className="lg:col-span-1"/>
                        <FeatureCard title="Guidance after 12th" description="Discover courses and find the best colleges." icon="🏫" onClick={() => setFlow(Flow.AfterTwelve)} className="lg:col-span-1"/>
                        <FeatureCard title="Take Skills Assessment" description="Discover your strengths and get personalized suggestions." icon="💡" onClick={handleStartAssessment} className="lg:col-span-1"/>
                        <FeatureCard title="Job Market Analysis" description="Get real-time insights on career demand and skills." icon="📈" onClick={() => setFlow(Flow.JobMarketAnalysis)} className="lg:col-span-2"/>
                        <FeatureCard title="Talk to an Expert" description="Schedule a mock session with a career counselor." icon="💬" onClick={() => setFlow(Flow.TalkToExpert)} className="lg:col-span-1"/>
                    </div>
                </div>
            );
        }

        if (flow === Flow.TalkToExpert) {
             return (
                <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-center text-indigo-400">Talk to a Career Expert</h2>
                     {!expertFormSubmitted ? (
                         <>
                         <p className="text-slate-400 text-center">Fill out the form below to schedule a mock consultation.</p>
                         <form onSubmit={handleExpertFormSubmit} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold text-slate-300">Full Name</label>
                                <input type="text" className="w-full bg-slate-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-slate-300">Email Address</label>
                                <input type="email" className="w-full bg-slate-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-slate-300">What would you like to discuss?</label>
                                <textarea className="w-full bg-slate-700 p-2 rounded h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Choosing a major, career change, etc."></textarea>
                            </div>
                            <div className="flex gap-4 pt-2">
                                {renderBackButton()}
                                <Button type="submit">Submit Request</Button>
                            </div>
                        </form>
                        </>
                    ) : (
                        <div className="text-center bg-slate-800/50 p-8 rounded-lg border border-slate-700">
                             <div className="text-5xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-green-400">Request Sent!</h3>
                            <p className="text-slate-300 mt-2">Our "expert" will "get back to you" shortly. Thank you for using Career Compass!</p>
                             <div className="mt-6">
                                <Button onClick={resetState}>Back to Home</Button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if(flow === Flow.JobMarketAnalysis) {
            return (
                 <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-center text-indigo-400">Job Market Analysis</h2>
                    <p className="text-slate-400 text-center">Enter a career or skill to get the latest market insights.</p>
                     <form onSubmit={handleJobMarketAnalysis} className="flex gap-2">
                        <input type="text" value={jobMarketQuery} onChange={e => setJobMarketQuery(e.target.value)} className="flex-grow bg-slate-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Data Scientist, Graphic Design..." required />
                        <Button type="submit">Analyze</Button>
                    </form>
                    
                    {jobMarketResult && (
                         <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                            <h3 className="text-2xl font-bold">{jobMarketQuery}</h3>
                            <p className="text-slate-300">{jobMarketResult.summary}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <h4 className="font-bold text-indigo-300">Market Demand</h4>
                                    <p>{jobMarketResult.demand}</p>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <h4 className="font-bold text-indigo-300">Salary Trends</h4>
                                    <p>{jobMarketResult.salaryTrends}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-300 mb-2">Essential Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {jobMarketResult.requiredSkills.map(skill => (
                                        <span key={skill} className="bg-slate-700 text-slate-300 px-3 py-1 text-sm rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="text-center pt-4">{renderBackButton()}</div>
                 </div>
            );
        }
        
        if (flow === Flow.SkillsAssessment) {
            switch (step) {
                case 1:
                    return (
                        <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-indigo-400">Skills Assessment</h2>
                            <p className="text-slate-400">How are you feeling about your future path? This will help us choose the right questions for you.</p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                               <Button onClick={() => setStep(1.5)}>I have a few interests</Button>
                               <Button onClick={handleStartHotsAssessment} variant="secondary">I'm really confused</Button>
                            </div>
                            <div className="pt-4">{renderBackButton()}</div>
                        </div>
                    );
                case 1.5:
                    return (
                        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold">Personalize Your Assessment</h2>
                            <p className="text-slate-400">Select a few subjects or topics you're interested in. This will help us create a quiz just for you.</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {commonInterests.map(interest => {
                                    const isSelected = assessmentInterests.includes(interest);
                                    return (
                                        <button 
                                            key={interest} 
                                            onClick={() => handleInterestToggle(interest)}
                                            className={`px-4 py-2 rounded-full border-2 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 hover:border-indigo-500'}`}
                                        >
                                            {interest}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-center gap-4 pt-4">
                                {renderBackButton()}
                                <Button onClick={handleInterestsSubmit} disabled={assessmentInterests.length === 0}>
                                    Generate My Quiz
                                </Button>
                            </div>
                        </div>
                    );
                case 2:
                    if (!assessmentQuestions.length) return null;
                    const currentQuestion = assessmentQuestions[currentQuestionIndex];
                    return (
                        <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
                            <ProgressBar current={currentQuestionIndex + 1} total={assessmentQuestions.length} />
                             <h2 className="text-2xl font-bold">Question {currentQuestionIndex + 1}/{assessmentQuestions.length}</h2>
                            <p className="text-slate-300 text-xl">{currentQuestion.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => (
                                    <Button key={index} onClick={() => handleAnswerSubmit(option)} variant="secondary">{option}</Button>
                                ))}
                            </div>
                             <div className="text-center pt-4">{renderBackButton()}</div>
                        </div>
                    );
                case 3:
                    if (!assessmentResult) return null;
                    return (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                                <h2 className="text-3xl font-bold text-indigo-400 mb-2">Assessment Complete!</h2>
                                <p className="text-slate-300">{assessmentResult.summary}</p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-4">Suggested Subject Streams</h3>
                                <div className="flex flex-wrap gap-4">
                                    {assessmentResult.suggestedStreams.map(stream => (
                                        <button key={stream} onClick={() => handleSelectSubject10(stream)} className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors">
                                            {stream}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Suggested Career Paths</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assessmentResult.suggestedCareers.map(option => (
                                        <Card key={option.careerName} title={option.careerName} description={option.description} onClick={() => handleSelectCareer10(option.careerName, assessmentResult.suggestedStreams[0])} badge={option.estimatedSalaryPotential} />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center pt-4">
                               <Button onClick={resetState}>Back to Home</Button>
                            </div>
                        </div>
                    );
            }
        }


        if (flow === Flow.AfterTen) {
            switch (step) {
                case 1:
                    return (
                        <div className="text-center space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold">Guidance After 10th Grade</h2>
                            <p className="text-slate-400">Choose a subject stream you plan to take in 11th & 12th to see career paths.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {Object.values(SubjectStream10).map(subject => (
                                    <Button key={subject} onClick={() => handleSelectSubject10(subject)}>{subject}</Button>
                                ))}
                            </div>
                            <div className="pt-4">{renderBackButton()}</div>
                        </div>
                    );
                case 2:
                    return (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center">Career Options for {selectedSubject10}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {careerOptions.map(option => (
                                    <Card key={option.careerName} title={option.careerName} description={option.description} onClick={() => handleSelectCareer10(option.careerName, selectedSubject10!)} badge={option.estimatedSalaryPotential} />
                                ))}
                            </div>
                             <div className="text-center">{renderBackButton()}</div>
                        </div>
                    );
                case 3: return renderPathway(`Pathway to: ${selectedCareer}`, `Based on your choice of ${selectedSubject10}`);
            }
        }
        
        if (flow === Flow.AfterTwelve) {
            switch (step) {
                case 1:
                    return (
                         <div className="text-center space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold">Guidance After 12th Grade</h2>
                            <p className="text-slate-400">Select your 12th grade subject stream to begin.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {Object.values(SubjectStream12).map(subject => (
                                    <Button key={subject} onClick={() => handleSelectSubject12(subject)}>{subject}</Button>
                                ))}
                            </div>
                            <div className="pt-4">{renderBackButton()}</div>
                        </div>
                    );
                case 2:
                    return (
                         <div className="space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center">Course Options for {selectedSubject12}</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {courseOptions.map(course => (
                                    <button key={course} onClick={() => handleSelectCourse12(course)} className="p-4 bg-slate-800/50 rounded-lg text-left hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all">
                                        {course}
                                    </button>
                                ))}
                            </div>
                            <div className="text-center">{renderBackButton()}</div>
                        </div>
                    );
                case 3:
                     return (
                        <div className="text-center space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold">You've selected: {selectedCourse}</h2>
                            <p className="text-slate-400">What would you like to explore next?</p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                               <Button onClick={handleFindColleges}>Find Best Colleges</Button>
                               <Button onClick={handleFindCareers}>Find Career Options</Button>
                            </div>
                             <div className="pt-4">{renderBackButton()}</div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center">Find Best Colleges</h2>
                            <p className="text-slate-400 text-center">Enter your details to get personalized college suggestions.</p>
                            <form onSubmit={handleProfileSubmit} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                                <div>
                                    <label className="block mb-1 font-semibold text-slate-300">10th Grade Marks (Percentage or CGPA)</label>
                                    <input type="text" value={studentProfile.marks10} onChange={e => setStudentProfile({...studentProfile, marks10: e.target.value})} className="w-full bg-slate-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-slate-300">12th Grade Marks (Percentage or CGPA)</label>
                                    <input type="text" value={studentProfile.marks12} onChange={e => setStudentProfile({...studentProfile, marks12: e.target.value})} className="w-full bg-slate-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-slate-300">Achievements (e.g., Olympiads, sports, etc.)</label>
                                    <textarea value={studentProfile.achievements} onChange={e => setStudentProfile({...studentProfile, achievements: e.target.value})} className="w-full bg-slate-700 p-2 rounded h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="List any notable achievements"></textarea>
                                </div>
                                <div className="flex gap-4">
                                    {renderBackButton()}
                                    <Button type="submit">Get Suggestions</Button>
                                </div>
                            </form>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center">College Suggestions for {selectedCourse}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {colleges.map(college => (
                                    <Card key={college.collegeName} title={college.collegeName} description={`${college.location} - ${college.reason}`} onClick={() => handleSelectCollege(college.collegeName)} badge={college.tier}/>
                                ))}
                            </div>
                            <div className="text-center">{renderBackButton()}</div>
                        </div>
                    );
                case 6: return renderPathway(`Admission Pathway for ${selectedCollege}`, `For the ${selectedCourse} program.`);
                case 7:
                     return (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-3xl font-bold text-center">Career Options After {selectedCourse}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {careerOptions.map(option => (
                                    <Card key={option.careerName} title={option.careerName} description={option.description} onClick={() => handleSelectCareer12(option.careerName)} badge={option.estimatedSalaryPotential} />
                                ))}
                            </div>
                            <div className="text-center">{renderBackButton()}</div>
                        </div>
                    );
                case 8: return renderPathway(`Pathway to: ${selectedCareer}`, `After completing ${selectedCourse}`);
            }
        }

        return null;
    };


    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <Header onHomeClick={resetState} />
            {isLoading && <LoadingSpinner />}
            <main className="container mx-auto p-4 md:p-8">
                {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6 text-center">{error}</div>}
                {renderContent()}
            </main>
        </div>
    );
};

export default App;