import api from "../api/interceptors";;

export const getLeaves = async (status) =>{
    const res = await api.get("/leaves",{
        params: status ? {status} : {},
    });

    return res.data.data;
}

//HR: Approve Leave
export const approveLeave = async (id)=>{
    const res = await api.put(`/leaves/${id}`, { status: "Approved" });
    return res.data;
}

//HR: Reject Leave
export const rejectLeave = async(id)=>{
    const res = await api.put(`/leaves/${id}`, { status: "Rejected" });
    return res.data;
}
