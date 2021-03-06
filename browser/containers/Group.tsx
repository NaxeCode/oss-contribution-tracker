/* Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import * as React from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Link } from 'react-router-dom';
import { reqJSON } from '../util/index';

import ProjectTable from '../components/ProjectTable';
import ReportForm from '../components/ReportForm';
import StrategicTable from '../components/StrategicTable';
import UserTable from '../components/UserTable';

interface Props {
  params: any;
  user: {
    user: string;
    groups: string[];
    roles: string[];
    access: string[];
  };
}

interface State {
  alert: JSX.Element;
  projectList: Array<{
    project_id: number;
    project_name: string;
    project_url: string;
    project_license: string;
    project_verified: boolean;
    project_auto_approvable: boolean;
    contribWeek: number;
    contribMTD: number;
    contribMonth: number;
    contribYear: number;
    numGroups?: number;
    numUsers?: number;
  }>;
  userList: Array<{
    company_alias: string;
    contribMTD: number;
    contribMonth: number;
    contribWeek: number;
    contribYear: number;
    github_alias: string;
    groups: any; // in the format of an number: string, however the number is always changing so I cannot specify a key
  }>;
  group: {
    group_id?: number;
    group_name?: string;
    goal?: string;
    sponsor?: string;
    projects?: number[];
  };
  contributionList: Array<{
    approval_date: string;
    approval_notes: string;
    approval_status: string;
    approver_id: number;
    contirbution_closed_date: string;
    contribution_date: string;
    contirbution_description: string;
    contribution_github_status: string;
    contribution_id: number;
    contribution_metdata: any;
    contribution_project_review: boolean;
    contribution_submission_date: string;
    contribution_url: string;
    contributor_alias: string;
    project_id: number;
    project_name: string;
  }>;
}

export default class Group extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      projectList: [],
      userList: [],
      group: {},
      contributionList: [],
      alert: null,
    };
  }

  async componentDidMount() {
    const groupId = this.props.params.group_id;
    const group = await reqJSON('/api/strategic/groups/' + groupId.toString());
    const contributions = await reqJSON(
      '/api/strategic/contributions/group/' + groupId.toString()
    );
    this.setState({
      projectList: group.projects,
      userList: group.users,
      group: group.group,
      contributionList: contributions,
    });
  }

  handleDownload = e => {
    this.alert();
  };

  alert = () => {
    this.setState({
      alert: (
        <SweetAlert
          title="Report Date"
          onConfirm={this.hideAlert}
          showConfirm={false}
        >
          Please select the specific month and year for the report.
          <ReportForm
            groupId={this.state.group.group_id}
            hideAlert={this.hideAlert}
          />
        </SweetAlert>
      ),
    });
  };

  hideAlert = () => {
    this.setState({ alert: null });
  };

  render() {
    return (
      <div>
        {this.props.user.access.includes('admin') ? (
          <Link
            className="badge badge-danger"
            id="edit-group"
            to={`/admin?strategic_group=${this.state.group.group_id}`}
          >
            Edit Group
          </Link>
        ) : (
          <div />
        )}
        <div className="group-header">
          <h2>{this.state.group.group_name} - Group Details</h2>
          <button className="btn btn-primary" onClick={this.handleDownload}>
            Download Report
          </button>
        </div>
        <hr />
        <h4> Projects </h4>
        <div id="contributionsListAll">
          <ProjectTable projectList={this.state.projectList} type="group" />
        </div>
        <br />
        <h4> Whitelisted Users </h4>
        <div id="contributionsListAll">
          <UserTable userList={this.state.userList} />
        </div>
        <br />
        <h4> Contributions </h4>
        <div id="contributionsListAll">
          <StrategicTable
            contributionList={this.state.contributionList}
            type="group"
          />
        </div>
        {this.state.alert}
      </div>
    );
  }
}
