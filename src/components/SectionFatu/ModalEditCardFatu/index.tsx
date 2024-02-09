import styled from './styles.module.scss'
import { useContext, useState } from 'react';
import { CardsContext, iCard, iDataForm, iTask } from '@/context/cards.context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { editCardSchema, editCardSchemaType } from '@/schema/cards.schema';
import { Dispatch, SetStateAction } from 'react';
import { AuthContext } from '@/context/auth.context';
import { FaPen } from 'react-icons/fa';
import { ClientContext } from '@/context/client.context';
import { UploadFileComponente } from '@/components/UploadFileComponente';


export const ModalEditCardFatu = ({ infoCard, setOpenModalEdit }:{ infoCard: iCard, setOpenModalEdit: Dispatch<SetStateAction<boolean>> }) => {

    const { allUser, userId } = useContext(AuthContext);
    const { allClient} = useContext(ClientContext);
    const { excluirSupCard, editarCard, excluirTask } = useContext(CardsContext);

    const userAuthorized = allUser!.map(user => {
        if (user.function && user.function.includes('Faturamento')) {
            return user;
        }
        return null;
    }).filter(user => user !== null);
    const isAuthorized = userAuthorized.some((user: any) => user.id === userId);

    const [editingTitle, setEditingTitle] = useState(false);
    const handleEditTitle = () => {
        setEditingTitle(!editingTitle);
    };

    const tasksinfoCard: any = infoCard.tasks!
    const [tasksDB, setTasksDB] = useState<any>(tasksinfoCard);
    const [novaTarefa, setNovaTarefa] = useState('');
    const handleCheckboxChange = (index: number) => {
        const updatedTasks = [...tasksDB];
        updatedTasks[index].completed = !updatedTasks[index].completed;
        setTasksDB(updatedTasks);
    };

    const handleCriarTarefa = () => {
        if (novaTarefa.trim() !== '') {
            const novaTarefaObj = { task: novaTarefa, completed: false };
            setTasksDB((prevTasks: any) => [...prevTasks, novaTarefaObj]);
            setNovaTarefa('');
        }
    };
    const excluirTarefa = (index: number, id: any | undefined) => {
        const novaListaTarefas = [...tasksDB];
        novaListaTarefas.splice(index, 1);
        if(id){
            excluirTask(id)
        }
        setTasksDB(novaListaTarefas);
    };
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(false);
    const confirmaExcluir = (cardId: string)=> {
        if (isAuthorized) {
            excluirSupCard(cardId)
            setOpenModalEdit(false)
        }
    }

    const [selectedOptions, setSelectedOptions] = useState(infoCard.type || []);
    const handleCheckboxChangeType = (e: any) => {
        const { value } = e.target;
        if (selectedOptions.includes(value)) {
            setSelectedOptions(selectedOptions.filter(option => option !== value));
        } else {
            setSelectedOptions([...selectedOptions, value]);
        }
    };

    const [selectedClient, setSelectedClient] = useState<string>('');
    const [selectedNames, setSelectedNames] = useState(infoCard.clients || [])
    const handleSave = () => {
      if (selectedClient && !selectedNames.includes(selectedClient)) {
        setSelectedNames(prevSelectedNames => [...prevSelectedNames, selectedClient]);
      }
    };
    const handleRemoveName = (nameToRemove: string) => {
      setSelectedNames(prevSelectedNames => prevSelectedNames.filter(name => name !== nameToRemove));
    };

    const { register, handleSubmit, formState: { errors } } = useForm<editCardSchemaType>({
        resolver: zodResolver(editCardSchema),
    });
    const onSubmit = (form: iDataForm) => {
        if(selectedOptions.length > 0){
            const dataForm = { ...form, type: selectedOptions, clients: selectedNames };
            editarCard(infoCard.id, dataForm, tasksDB);
            setOpenModalEdit(false);
        }
    };

    return (
        <section className={styled.modal}>
            <div className={styled.modalCard}>
                <form className={styled.form} onSubmit={handleSubmit(onSubmit)}>

                    <div className={styled.divHeader}>
                        {editingTitle ? (
                            <div className={styled.divInputTitle}>
                                {isAuthorized && <FaPen className={styled.editar} onClick={handleEditTitle} />}
                                <input className={styled.inputTitle} id="title" type="text" {...register("title")} placeholder="Digite o Título" defaultValue={infoCard.title}/>
                                {errors.title?.message && (<p className={styled.pError}>{errors.title.message}</p>)}
                            </div>
                        ) : (
                            <div className={styled.divInputTitle}>
                                {isAuthorized && <FaPen className={styled.editar} onClick={handleEditTitle} />}
                                <h1 className={styled.title}>{infoCard.title}</h1>
                            </div>
                        )}
                        <div className={styled.divCreateBtn}>
                            <div className={styled.divNomeData}>|
                                <div>
                                    <h3 className={styled.h3Data}>C: {infoCard.createdAt!.slice(0, 16)}</h3>
                                    <h3 className={styled.h3Data}>E: {infoCard.updatedAt!.slice(0, 16)}</h3>
                                </div>|
                            </div>
                            <button className={styled.btnFecha} type='button' onClick={() => setOpenModalEdit(false)}>Fechar</button>
                        </div>
                    </div>

                    {!isAuthorized && (
                        <p className={styled.pAuthorized}>Você não é autorizado a fazer edições</p>
                    )}

                    <div className={styled.divSelect}>
                        <div className={styled.divPriority}>
                            <p className={styled.pDesc}>Prioridade: </p>
                            <select className={styled.select} id="opcoes" {...register('priority')} defaultValue={infoCard.priority || 'Normal'} disabled={!isAuthorized}>
                                <option value="Basica">Basica</option>
                                <option value="Normal">Normal</option>
                                <option value="Urgente">Urgente</option>
                                <option value="Muito Urgente">Muito Urgente</option>
                            </select>
                        </div>
                        <div className={styled.divType}>
                            <p className={styled.pDesc}>Setor: </p>
                            <div className={styled.checkboxContainer}>
                                <div className={styled.divLabel}>
                                    {['Suporte', 'Programação', 'Faturamento', 'Suporte Hospital', 'Instalação'].map((type, index) => (
                                        <label className={styled.labelType} key={index}>
                                            <input type="checkbox" value={type} checked={selectedOptions.includes(type)} onChange={handleCheckboxChangeType} disabled={!isAuthorized}/>{type}
                                        </label>
                                    ))}
                                </div>
                                {selectedOptions.length === 0 && (
                                    <p className={styled.pError}>Escolha ao menos um Setor</p>
                                )}
                            </div>
                        </div>
                    </div> 

                    {isAuthorized && (
                        <div className={styled.divClientSelect}>
                            <div className={styled.divSelectClient}>
                                <p className={styled.pDesc}>Cliente: </p>
                                <div>
                                    <select className={styled.selectClient} onChange={(event) => setSelectedClient(event.target.value)}>
                                        <option value=''> - Selecione - </option>
                                        {allClient.map((cliente, index) => (
                                            <option key={index} value={cliente.companyName}>{cliente.companyName}</option>
                                            ))}
                                    </select>
                                <button className={styled.btnSlavar} onClick={handleSave} type='button'>Salvar</button>
                                </div>
                            </div>
                            {selectedNames.length > 0 && (
                                <div className={styled.divClient}>
                                    {selectedNames.map((nome, index) => (
                                        <div className={styled.divNameBtn} key={index}>
                                            <p className={styled.pName}>{nome}</p>
                                            <button className={styled.btnExcluir} type='button' onDoubleClick={() => handleRemoveName(nome.toString())}>X</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styled.divDesc}>
                        <p className={styled.pDesc}>Descrição:</p>
                        <textarea className={styled.textarea} id="descriptin" {...register("description")} defaultValue={infoCard.description || ''} readOnly={!isAuthorized}></textarea>
                    </div>

                    <div className={styled.divTarefas}>
                        <div className={styled.divTitleTarefas}>
                            <h2 className={styled.pDesc}>Tarefas</h2>
                        </div>
                        <div className={styled.divInput}>
                            <div className={styled.divAddTarefa}>
                                <input type="text" placeholder="Digite a nova tarefa" value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} disabled={!isAuthorized}/>
                                <button type="button" onClick={handleCriarTarefa} disabled={!isAuthorized} className={styled.btnSlavar} >Criar</button>
                            </div>
                            <div className={styled.divUl}>
                                <ul className={styled.ul}>
                                    {tasksDB.map((tarefa: iTask, index: number) => (
                                        <li className={styled.li} key={index}>
                                            <div>
                                                <div>
                                                    <input type="checkbox" checked={tarefa.completed} onChange={() => handleCheckboxChange(index)} disabled={!isAuthorized}/> 
                                                    <label className={styled.newLabol} htmlFor={`tarefa-${index}`}>{tarefa.task}</label>
                                                </div>
                                            </div>
                                            <button className={styled.btnExcluir} type="button" onDoubleClick={() => excluirTarefa(index, tarefa.id)} disabled={!isAuthorized}>X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className={styled.divDesc}>
                        <p className={styled.pDesc}>Solução:</p>
                        <textarea className={styled.textarea} id="solution" {...register("solution")} defaultValue={infoCard.solution || ''} readOnly={!isAuthorized}></textarea>
                    </div>

                    <UploadFileComponente/>

                    {isAuthorized ? (
                        <div className={styled.divExcluir}>
                            <button type='submit' className={styled.salvar}>Salvar</button>
                            <button type='button' onClick={() => setConfirmacaoExclusao(true)} className={styled.excluir}>Excluir</button>
                            {confirmacaoExclusao && (
                                <span className={styled.spanExcluir}>
                                    <p className={styled.pExcluir}>Tem certeza que deseja Excluir?</p>
                                    <div className={styled.divSimNao}>
                                        <button className={styled.btnSim} type='button' onClick={() => confirmaExcluir(infoCard.id)}>Excluir</button>
                                        <button className={styled.btnNao} type='button' onClick={() => setConfirmacaoExclusao(false)}>Não Excluir</button>
                                    </div>
                                </span>
                            )}
                        </div>
                    ) : null }

                </form>
            </div>
        </section>
    );
};